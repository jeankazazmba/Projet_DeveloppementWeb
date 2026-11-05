<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuOption;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Models\DiningTable;
use App\Models\DeliveryPosition;
use App\Models\TableReservation;
use App\Support\RestaurantAccess;
use App\Support\OrderView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StaffOrderController extends Controller
{
    public function index(Request $request, Restaurant $restaurant)
    {
        $role = RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        $filters = $request->validate(['status' => ['nullable', 'string', 'max:40'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        return Order::where('restaurant_id', $restaurant->id)->whereNotNull('user_id')
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->with(['lines', 'events', 'table'])->orderByDesc('created_at')->paginate($filters['per_page'] ?? 25)
            ->through(fn ($order) => OrderView::forStaff($order, $role, $request->user()->id));
    }

    public function show(Request $request, Restaurant $restaurant, Order $order)
    {
        $role = RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        abort_unless($order->restaurant_id === $restaurant->id && $order->user_id !== null, 404);
        return OrderView::forStaff($order, $role, $request->user()->id);
    }

    public function status(Request $request, Order $order)
    {
        $restaurant = Restaurant::findOrFail($order->restaurant_id);
        $role = RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        $data = $request->validate([
            'status' => ['required', Rule::in(['accepted', 'preparing', 'ready', 'served', 'delivering', 'delivered', 'cancelled'])],
            'expected_version' => ['required', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);
        if ($data['status'] === 'cancelled') abort_if($role === 'employee', 403);
        if ($data['status'] === 'cancelled') abort_if(empty($data['reason']), 422, 'Un motif est obligatoire pour annuler.');
        DB::transaction(function () use ($request, $order, $data, $role) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->user_id !== null, 404);
            abort_if($locked->version !== $data['expected_version'], 409, 'Commande modifiée. Rechargez-la.');
            $allowed = match ($locked->status) {
                'received' => ['accepted', 'cancelled'],
                'accepted' => ['preparing', 'cancelled'],
                'preparing' => ['ready', 'cancelled'],
                'ready' => $locked->service === 'delivery' ? ['delivering', 'cancelled'] : ['served', 'cancelled'],
                'delivering' => ['delivered', 'cancelled'],
                default => [],
            };
            abort_unless(in_array($data['status'], $allowed, true), 409, 'Transition de statut interdite.');
            if ($data['status'] === 'delivering') abort_unless($locked->delivery_assignee_id, 409, 'Affectez d’abord un employé à la livraison.');
            if (in_array($data['status'], ['delivering', 'delivered'], true) && $role === 'employee') {
                abort_unless($locked->delivery_assignee_id === $request->user()->id, 403);
            }
            if ($data['status'] === 'cancelled') $this->restoreStock($locked);
            if (in_array($data['status'], ['cancelled', 'served'], true)) $locked->reservation()->where('status', 'active')->update(['status' => 'released']);
            $before = $locked->status;
            $locked->update(['status' => $data['status'], 'version' => $locked->version + 1]);
            $locked->events()->create(['actor_id' => $request->user()->id, 'from_status' => $before, 'to_status' => $data['status'],
                'action' => 'status_changed', 'reason' => $data['reason'] ?? null, 'order_version' => $locked->version, 'created_at' => now()]);
        });
        return OrderView::forStaff($order->refresh(), $role, $request->user()->id);
    }

    public function assignDelivery(Request $request, Order $order)
    {
        $restaurant = Restaurant::findOrFail($order->restaurant_id);
        $role = RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        abort_unless($order->user_id !== null && $order->service === 'delivery', 404);
        $data = $request->validate(['employee_id' => ['required', 'integer'], 'expected_version' => ['required', 'integer', 'min:1'], 'reason' => ['nullable', 'string', 'max:1000']]);
        $employee = $restaurant->users()->whereKey($data['employee_id'])->wherePivot('role', 'employee')->wherePivot('is_active', true)->first();
        abort_unless($employee && $employee->is_active, 422, 'Employé non autorisé dans ce restaurant.');
        DB::transaction(function () use ($request, $order, $data) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            abort_unless(in_array($locked->status, ['received', 'accepted', 'preparing', 'ready'], true), 409);
            $locked->update(['delivery_assignee_id' => $data['employee_id'], 'delivery_assigned_at' => now(), 'version' => $locked->version + 1]);
            $locked->events()->create(['actor_id' => $request->user()->id, 'from_status' => $locked->status, 'to_status' => $locked->status,
                'action' => 'delivery_assigned', 'reason' => $data['reason'] ?? null, 'order_version' => $locked->version, 'created_at' => now()]);
        });
        return OrderView::forStaff($order->refresh(), $role, $request->user()->id);
    }

    public function assignTable(Request $request, Order $order)
    {
        $restaurant = Restaurant::findOrFail($order->restaurant_id);
        $role = RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        abort_unless($order->user_id !== null && $order->service === 'dine_in', 404);
        $data = $request->validate(['dining_table_id' => ['required', 'integer'], 'expected_version' => ['required', 'integer', 'min:1'], 'reason' => ['nullable', 'string', 'max:1000']]);
        DB::transaction(function () use ($request, $order, $restaurant, $data) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            abort_if(in_array($locked->status, ['served', 'cancelled'], true), 409);
            $table = DiningTable::whereKey($data['dining_table_id'])->where('restaurant_id', $restaurant->id)->where('is_active', true)->lockForUpdate()->first();
            abort_unless($table && $table->capacity >= $locked->party_size, 422, 'Table invalide ou trop petite.');
            $starts = $locked->requested_at; $ends = $starts->copy()->addMinutes(90);
            abort_if(TableReservation::where('dining_table_id', $table->id)->where('order_id', '!=', $locked->id)
                ->where('status', 'active')->where('starts_at', '<', $ends)->where('ends_at', '>', $starts)->exists(), 409, 'Table déjà réservée.');
            $locked->reservation()->updateOrCreate(['order_id' => $locked->id], [
                'dining_table_id' => $table->id, 'starts_at' => $starts, 'ends_at' => $ends, 'status' => 'active',
            ]);
            $locked->update(['dining_table_id' => $table->id, 'version' => $locked->version + 1]);
            $locked->events()->create(['actor_id' => $request->user()->id, 'from_status' => $locked->status, 'to_status' => $locked->status,
                'action' => 'table_assigned', 'reason' => $data['reason'] ?? null, 'order_version' => $locked->version, 'created_at' => now()]);
        });
        return OrderView::forStaff($order->refresh(), $role, $request->user()->id);
    }

    public function position(Request $request, Order $order)
    {
        $restaurant = Restaurant::findOrFail($order->restaurant_id);
        RestaurantAccess::require($request, $restaurant, ['employee']);
        abort_unless($order->user_id !== null && $order->service === 'delivery' && $order->delivery_assignee_id === $request->user()->id, 404);
        abort_unless($order->status === 'delivering', 409, 'La livraison n’est pas en cours.');
        $data = $request->validate(['latitude' => ['required', 'numeric', 'between:-90,90'], 'longitude' => ['required', 'numeric', 'between:-180,180']]);
        return response()->json(DeliveryPosition::create(['order_id' => $order->id, 'actor_id' => $request->user()->id,
            'latitude' => $data['latitude'], 'longitude' => $data['longitude'], 'recorded_at' => now()]), 201);
    }

    public function tracking(Request $request, Restaurant $restaurant, Order $order)
    {
        $role = RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        abort_unless($order->restaurant_id === $restaurant->id && $order->user_id !== null && $order->service === 'delivery', 404);
        if ($role === 'employee') abort_unless($order->delivery_assignee_id === $request->user()->id, 404);
        return ['id' => $order->id, 'status' => $order->status, 'position' => $order->positions()->latest('id')->first()];
    }

    private function restoreStock(Order $order): void
    {
        $dishCounts = []; $optionCounts = [];
        foreach ($order->lines as $line) {
            if ($line->content_id && $line->stock_reserved) $dishCounts[$line->content_id] = ($dishCounts[$line->content_id] ?? 0) + $line->quantity;
            foreach ($line->options_snapshot ?? [] as $option) {
                if ($option['stock_reserved'] ?? false) $optionCounts[$option['id']] = ($optionCounts[$option['id']] ?? 0) + $line->quantity;
            }
        }
        foreach ($dishCounts as $id => $quantity) {
            $dish = RestaurantContent::whereKey($id)->where('restaurant_id', $order->restaurant_id)->lockForUpdate()->first();
            if ($dish && $dish->stock_quantity !== null) $dish->update(['stock_quantity' => $dish->stock_quantity + $quantity, 'version' => $dish->version + 1]);
        }
        foreach ($optionCounts as $id => $quantity) {
            $option = MenuOption::whereKey($id)->lockForUpdate()->first();
            if ($option && $option->stock_quantity !== null && RestaurantContent::whereKey($option->content_id)->where('restaurant_id', $order->restaurant_id)->exists()) {
                $option->update(['stock_quantity' => $option->stock_quantity + $quantity, 'version' => $option->version + 1]);
            }
        }
    }
}
