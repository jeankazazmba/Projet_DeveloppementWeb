<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuOption;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StaffOrderController extends Controller
{
    public function index(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        $filters = $request->validate(['status' => ['nullable', 'string', 'max:40'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        return Order::where('restaurant_id', $restaurant->id)->whereNotNull('user_id')
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->with('lines')->orderByDesc('created_at')->paginate($filters['per_page'] ?? 25);
    }

    public function status(Request $request, Order $order)
    {
        $restaurant = Restaurant::findOrFail($order->restaurant_id);
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'])],
            'expected_version' => ['required', 'integer', 'min:1'],
        ]);
        DB::transaction(function () use ($request, $order, $data) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->user_id !== null, 404);
            abort_if($locked->version !== $data['expected_version'], 409, 'Commande modifiée. Rechargez-la.');
            $allowed = match ($locked->status) {
                'pending' => ['confirmed', 'cancelled'],
                'confirmed' => ['preparing', 'cancelled'],
                'preparing' => ['ready', 'cancelled'],
                'ready' => $locked->service === 'delivery' ? ['delivering', 'cancelled'] : ['completed', 'cancelled'],
                'delivering' => ['completed', 'cancelled'],
                default => [],
            };
            abort_unless(in_array($data['status'], $allowed, true), 409, 'Transition de statut interdite.');
            if ($data['status'] === 'cancelled') $this->restoreStock($locked);
            $before = $locked->status;
            $locked->update(['status' => $data['status'], 'version' => $locked->version + 1]);
            $locked->events()->create(['actor_id' => $request->user()->id, 'from_status' => $before, 'to_status' => $data['status'], 'created_at' => now()]);
        });
        return $order->refresh()->load(['lines', 'events']);
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
