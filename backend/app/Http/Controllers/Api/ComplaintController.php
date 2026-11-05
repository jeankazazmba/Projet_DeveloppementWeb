<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Order;
use App\Models\Restaurant;
use App\Support\ComplaintView;
use App\Support\RestaurantAccess;
use App\Support\StudentAccess;
use App\Support\DomainNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ComplaintController extends Controller
{
    public function store(Request $request, Restaurant $restaurant)
    {
        StudentAccess::require($request);
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        $data = $request->validate(['order_id' => ['nullable', 'string', 'max:80'], 'reason' => ['required', 'string', 'min:10', 'max:255']]);
        if (isset($data['order_id']) && !Order::whereKey($data['order_id'])->where('user_id', $request->user()->id)->where('restaurant_id', $restaurant->id)->exists()) {
            throw ValidationException::withMessages(['order_id' => 'Commande étrangère à ce compte ou restaurant.']);
        }
        $complaint = DB::transaction(function () use ($request, $restaurant, $data) {
            $complaint = Complaint::create([
                'id' => 'REC-'.Str::ulid(), 'restaurant_id' => $restaurant->id,
                'order_id' => $data['order_id'] ?? null, 'user_id' => $request->user()->id,
                'student_name' => $request->user()->name, 'reason' => $data['reason'], 'status' => 'ouverte',
            ]);
            $complaint->events()->create(['actor_id' => $request->user()->id, 'from_status' => null,
                'to_status' => 'ouverte', 'complaint_version' => 1, 'created_at' => now()]);
            DomainNotifications::staff($restaurant->id, 'complaint_opened', 'complaint:'.$complaint->id.':opened',
                ['complaint_id' => $complaint->id, 'restaurant_id' => $restaurant->id, 'status' => 'ouverte']);
            return $complaint;
        });
        return response()->json(ComplaintView::forStudent($complaint), 201);
    }

    public function mine(Request $request)
    {
        StudentAccess::require($request);
        $filters = $request->validate(['status' => ['nullable', 'string', 'max:40'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        return Complaint::where('user_id', $request->user()->id)->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')->paginate($filters['per_page'] ?? 25)->through(fn ($complaint) => ComplaintView::forStudent($complaint));
    }

    public function myShow(Request $request, Complaint $complaint)
    {
        StudentAccess::require($request);
        abort_unless($complaint->user_id === $request->user()->id && Gate::allows('view', $complaint), 404);
        return ComplaintView::forStudent($complaint);
    }

    public function studentMessage(Request $request, Complaint $complaint)
    {
        StudentAccess::require($request);
        abort_unless($complaint->user_id === $request->user()->id && Gate::allows('studentMessage', $complaint), 404);
        $data = $request->validate(['body' => ['required', 'string', 'min:1', 'max:5000']]);
        return response()->json($complaint->messages()->create(['author_id' => $request->user()->id, 'kind' => 'student',
            'visibility' => 'student', 'body' => $data['body'], 'created_at' => now()]), 201);
    }

    public function staffIndex(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['employee', 'manager', 'admin']);
        $filters = $request->validate(['status' => ['nullable', 'string', 'max:40'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        return Complaint::where('restaurant_id', $restaurant->id)->whereNotNull('user_id')
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')->paginate($filters['per_page'] ?? 25)->through(fn ($complaint) => ComplaintView::forStaff($complaint));
    }

    public function staffShow(Request $request, Restaurant $restaurant, Complaint $complaint)
    {
        RestaurantAccess::require($request, $restaurant, ['employee', 'manager', 'admin']);
        abort_unless($complaint->restaurant_id === $restaurant->id && $complaint->user_id !== null && Gate::allows('view', $complaint), 404);
        return ComplaintView::forStaff($complaint);
    }

    public function transition(Request $request, Complaint $complaint)
    {
        $restaurant = Restaurant::findOrFail($complaint->restaurant_id);
        $role = RestaurantAccess::require($request, $restaurant, ['employee', 'manager', 'admin']);
        abort_unless($complaint->user_id !== null && Gate::allows('view', $complaint), 404);
        $data = $request->validate([
            'status' => ['required', Rule::in(['prise_en_charge', 'proposition_employe', 'validation_gerant', 'decision_admin', 'resolue', 'rejetee', 'escaladee'])],
            'expected_version' => ['required', 'integer', 'min:1'],
            'body' => ['nullable', 'string', 'max:5000'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);
        $allowed = [
            'employee' => ['ouverte' => ['prise_en_charge'], 'prise_en_charge' => ['proposition_employe']],
            'manager' => ['proposition_employe' => ['validation_gerant', 'prise_en_charge']],
            'admin' => ['validation_gerant' => ['decision_admin'], 'decision_admin' => ['resolue', 'rejetee', 'escaladee']],
        ];
        DB::transaction(function () use ($request, $complaint, $role, $data, $allowed) {
            $locked = Complaint::whereKey($complaint->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409, 'Réclamation modifiée. Rechargez-la.');
            abort_unless(in_array($data['status'], $allowed[$role][$locked->status] ?? [], true), 409, 'Transition interdite pour ce rôle et ce statut.');
            if (in_array($data['status'], ['proposition_employe', 'decision_admin'], true) && empty($data['body'])) {
                throw ValidationException::withMessages(['body' => 'Un message est obligatoire pour cette étape.']);
            }
            if (in_array($data['status'], ['rejetee', 'escaladee'], true) || ($role === 'manager' && $data['status'] === 'prise_en_charge')) {
                if (empty($data['reason'])) throw ValidationException::withMessages(['reason' => 'Un motif est obligatoire.']);
            }
            $before = $locked->status;
            $locked->update(['status' => $data['status'], 'escalated' => $data['status'] === 'escaladee', 'version' => $locked->version + 1]);
            if (!empty($data['body'])) $locked->messages()->create([
                'author_id' => $request->user()->id,
                'kind' => match ($role) { 'employee' => 'employee_proposal', 'manager' => 'manager_note', default => 'admin_decision' },
                'visibility' => $role === 'admin' ? 'student' : 'internal',
                'body' => $data['body'], 'created_at' => now(),
            ]);
            $locked->events()->create(['actor_id' => $request->user()->id, 'from_status' => $before,
                'to_status' => $data['status'], 'reason' => $data['reason'] ?? null,
                'complaint_version' => $locked->version, 'created_at' => now()]);
            DomainNotifications::student($locked->user_id, $locked->restaurant_id, 'complaint_status',
                'complaint:'.$locked->id.':version:'.$locked->version,
                ['complaint_id' => $locked->id, 'restaurant_id' => $locked->restaurant_id, 'status' => $locked->status]);
            if ($locked->escalated) DomainNotifications::platformEscalation($locked->restaurant_id, $locked->id, $locked->status);
        });
        return ComplaintView::forStaff($complaint->refresh());
    }
}
