<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Support\RestaurantAccess;
use App\Support\StudentAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LoyaltyController extends Controller
{
    public function rules(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        return DB::table('loyalty_rules')->where('restaurant_id', $restaurant->id)->orderByDesc('id')->get();
    }

    public function createRule(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['points_per_order' => ['required', 'integer', 'min:0', 'max:100000'], 'referral_points' => ['required', 'integer', 'min:0', 'max:100000']]);
        $id = DB::table('loyalty_rules')->insertGetId(['restaurant_id' => $restaurant->id, ...$data,
            'created_by' => $request->user()->id, 'is_active' => false, 'version' => 1, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(DB::table('loyalty_rules')->find($id), 201);
    }

    public function validateRule(Request $request, Restaurant $restaurant, int $rule)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['validation_note' => ['required', 'string', 'min:10', 'max:1000'], 'expected_version' => ['required', 'integer', 'min:1']]);
        return DB::transaction(function () use ($request, $restaurant, $rule, $data) {
            $row = DB::table('loyalty_rules')->where('restaurant_id', $restaurant->id)->where('id', $rule)->lockForUpdate()->first();
            abort_unless($row, 404);
            abort_if($row->version !== $data['expected_version'], 409);
            abort_if($row->validated_at, 409, 'Règle déjà validée.');
            DB::table('loyalty_rules')->where('id', $rule)->update(['validated_by' => $request->user()->id, 'validated_at' => now(),
                'validation_note' => $data['validation_note'], 'version' => $row->version + 1, 'updated_at' => now()]);
            return DB::table('loyalty_rules')->find($rule);
        });
    }

    public function activateRule(Request $request, Restaurant $restaurant, int $rule)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        return DB::transaction(function () use ($restaurant, $rule, $data) {
            Restaurant::whereKey($restaurant->id)->lockForUpdate()->firstOrFail();
            $row = DB::table('loyalty_rules')->where('restaurant_id', $restaurant->id)->where('id', $rule)->lockForUpdate()->first();
            abort_unless($row, 404);
            abort_if($row->version !== $data['expected_version'], 409);
            abort_unless($row->validated_at && $row->validated_by && $row->validation_note, 409, 'Validation métier requise.');
            DB::table('loyalty_rules')->where('restaurant_id', $restaurant->id)->where('is_active', true)
                ->update(['is_active' => false, 'version' => DB::raw('version + 1'), 'updated_at' => now()]);
            DB::table('loyalty_rules')->where('id', $rule)->update(['is_active' => true, 'version' => $row->version + 1, 'updated_at' => now()]);
            return DB::table('loyalty_rules')->find($rule);
        });
    }

    public function loyalty(Request $request)
    {
        StudentAccess::require($request);
        $rows = DB::table('loyalty_movements')->where('user_id', $request->user()->id)->where('is_demo', false)->orderByDesc('id')->limit(100)
            ->get(['id', 'restaurant_id', 'points', 'reason', 'reference', 'created_at']);
        $balances = DB::table('loyalty_movements')->where('user_id', $request->user()->id)->where('is_demo', false)
            ->selectRaw('restaurant_id, SUM(points) as points')->groupBy('restaurant_id')->pluck('points', 'restaurant_id');
        return ['balances' => $balances,
            'movements' => $rows, 'limit' => 100];
    }

    public function referrals(Request $request)
    {
        StudentAccess::require($request);
        return ['codes' => DB::table('referral_codes')->where('user_id', $request->user()->id)->get(['restaurant_id', 'code']),
            'referrals' => DB::table('referrals')->where('referrer_id', $request->user()->id)->where('is_demo', false)
                ->orderByDesc('id')->get(['id', 'restaurant_id', 'status', 'rewarded_points', 'created_at', 'rewarded_at'])];
    }

    public function code(Request $request, Restaurant $restaurant)
    {
        StudentAccess::require($request);
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        $row = DB::table('referral_codes')->where('restaurant_id', $restaurant->id)->where('user_id', $request->user()->id)->first();
        if (!$row) {
            $code = strtoupper(Str::random(12));
            DB::table('referral_codes')->insertOrIgnore(['restaurant_id' => $restaurant->id, 'user_id' => $request->user()->id,
                'code' => $code, 'created_at' => now(), 'updated_at' => now()]);
            $row = DB::table('referral_codes')->where('restaurant_id', $restaurant->id)->where('user_id', $request->user()->id)->first();
        }
        return ['restaurant_id' => $restaurant->id, 'code' => $row->code];
    }

    public function claim(Request $request, Restaurant $restaurant)
    {
        StudentAccess::require($request);
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        $data = $request->validate(['code' => ['required', 'string', 'max:32']]);
        $code = DB::table('referral_codes')->where('code', strtoupper($data['code']))->where('restaurant_id', $restaurant->id)->first();
        if (!$code || $code->user_id === $request->user()->id) throw ValidationException::withMessages(['code' => 'Code de parrainage invalide.']);
        if (DB::table('orders')->where('restaurant_id', $restaurant->id)->where('user_id', $request->user()->id)
            ->whereIn('status', ['served', 'delivered'])->exists()) throw ValidationException::withMessages(['code' => 'Parrainage à enregistrer avant la première commande éligible.']);
        if (DB::table('referrals')->where('restaurant_id', $restaurant->id)->where('referee_id', $request->user()->id)->exists()) abort(409, 'Parrainage déjà enregistré.');
        $id = DB::table('referrals')->insertGetId(['restaurant_id' => $restaurant->id, 'referrer_id' => $code->user_id,
            'referee_id' => $request->user()->id, 'referral_code_id' => $code->id, 'status' => 'pending',
            'rewarded_points' => 0, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['id' => $id, 'restaurant_id' => $restaurant->id, 'status' => 'pending'], 201);
    }

    public function leaderboard(Request $request, Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        $period = $request->validate(['period' => ['required', Rule::in(['day', 'week', 'month'])]])['period'];
        $start = match ($period) {
            'day' => Carbon::now('Africa/Kinshasa')->startOfDay(),
            'week' => Carbon::now('Africa/Kinshasa')->startOfWeek(),
            'month' => Carbon::now('Africa/Kinshasa')->startOfMonth(),
        };
        $end = match ($period) {
            'day' => $start->copy()->addDay(), 'week' => $start->copy()->addWeek(), 'month' => $start->copy()->addMonth(),
        };
        $rows = DB::table('order_events as event')->join('orders as orders', 'orders.id', '=', 'event.order_id')
            ->where('orders.restaurant_id', $restaurant->id)->whereNotNull('orders.user_id')
            ->whereIn('event.to_status', ['served', 'delivered'])->where('event.action', 'status_changed')
            ->where('event.created_at', '>=', $start->copy()->utc())->where('event.created_at', '<', $end->copy()->utc())
            ->selectRaw('orders.user_id, COUNT(DISTINCT orders.id) as eligible_orders')->groupBy('orders.user_id')
            ->orderByDesc('eligible_orders')->orderBy('orders.user_id')->limit(10)->get();
        return ['restaurant_id' => $restaurant->id, 'period' => $period,
            'top' => $rows->values()->map(fn ($row, $index) => [
                'rank' => $index + 1,
                'display_name' => 'Client '.strtoupper(substr(hash_hmac('sha256', $restaurant->id.':'.$row->user_id, config('app.key')), 0, 6)),
                'eligible_orders' => (int) $row->eligible_orders,
            ])];
    }

    public function play(Request $request, Restaurant $restaurant, RestaurantContent $game)
    {
        StudentAccess::require($request);
        abort_unless($restaurant->status === 'active' && $restaurant->is_public && $game->restaurant_id === $restaurant->id
            && $game->kind === 'game' && $game->newQuery()->whereKey($game->id)->publicActive()->exists(), 404);
        $inserted = DB::table('game_participations')->insertOrIgnore(['restaurant_id' => $restaurant->id,
            'game_content_id' => $game->id, 'user_id' => $request->user()->id, 'created_at' => now()]);
        if (!$inserted) abort(409, 'Participation déjà enregistrée.');
        return response()->json(['restaurant_id' => $restaurant->id, 'game_id' => $game->id, 'status' => 'registered'], 201);
    }

    public function myGames(Request $request)
    {
        StudentAccess::require($request);
        return DB::table('game_participations')->where('user_id', $request->user()->id)->orderByDesc('id')->get(['id', 'restaurant_id', 'game_content_id', 'created_at']);
    }
}
