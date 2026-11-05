<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Support\OrderPricing;
use App\Support\StudentAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudentOrderController extends Controller
{
    public function quote(Request $request, Restaurant $restaurant)
    {
        StudentAccess::require($request);
        $data = $request->validate($this->rules());
        [$items] = $this->items($request, $restaurant, $data);
        return response()->json(OrderPricing::calculate($restaurant, $request->user()->id, $data, $items));
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        StudentAccess::require($request);
        $data = $request->validate($this->rules());
        $key = $request->header('Idempotency-Key');
        if (!is_string($key) || !preg_match('/^[A-Za-z0-9._:-]{8,120}$/', $key)) {
            throw ValidationException::withMessages(['Idempotency-Key' => 'En-tête Idempotency-Key obligatoire (8 à 120 caractères).']);
        }
        $hash = hash('sha256', json_encode([$restaurant->id, $data], JSON_THROW_ON_ERROR));
        [$order, $replayed] = DB::transaction(function () use ($request, $restaurant, $data, $key, $hash) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $existing = Order::where('user_id', $request->user()->id)->where('idempotency_key', $key)->first();
            if ($existing) {
                abort_if($existing->request_hash !== $hash, 409, 'Cette clé a déjà été utilisée pour une autre demande.');
                return [$existing, true];
            }
            [$items, $cart] = $this->items($request, $restaurant, $data);
            $quote = OrderPricing::calculate($restaurant, $request->user()->id, $data, $items, true);
            $order = Order::create([
                'id' => 'ORD-'.Str::ulid(), 'restaurant_id' => $restaurant->id,
                'user_id' => $request->user()->id, 'customer_name' => $request->user()->name,
                'service' => $quote['service'], 'status' => 'pending',
                'amount_cdf' => $quote['total_cdf'], 'subtotal_cdf' => $quote['subtotal_cdf'],
                'delivery_fee_cdf' => $quote['delivery_fee_cdf'],
                'service_slot_id' => $quote['service_slot_id'],
                'delivery_address_id' => $quote['delivery_address_id'],
                'delivery_address_snapshot' => $quote['delivery_address_snapshot'],
                'requested_at' => $quote['requested_at'],
                'idempotency_key' => $key, 'request_hash' => $hash,
            ]);
            $order->lines()->createMany($quote['lines']);
            $order->events()->create(['actor_id' => $request->user()->id, 'from_status' => null, 'to_status' => 'pending', 'created_at' => now()]);
            if ($cart) $cart->delete();
            return [$order, false];
        });
        return response()->json($order->load(['lines', 'events', 'address']), $replayed ? 200 : 201);
    }

    public function index(Request $request)
    {
        StudentAccess::require($request);
        $filters = $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'status' => ['nullable', 'string', 'max:40']]);
        return Order::where('user_id', $request->user()->id)->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->with('lines')->orderByDesc('created_at')->paginate($filters['per_page'] ?? 25);
    }

    public function show(Request $request, Order $order)
    {
        StudentAccess::require($request);
        abort_unless($order->user_id === $request->user()->id, 404);
        return $order->load(['lines', 'events', 'address']);
    }

    private function items(Request $request, Restaurant $restaurant, array $data): array
    {
        if (array_key_exists('items', $data)) return [$data['items'], null];
        $cart = Cart::where('user_id', $request->user()->id)->with('items')->first();
        if (!$cart || $cart->restaurant_id !== $restaurant->id) throw ValidationException::withMessages(['items' => 'Panier absent pour ce restaurant.']);
        return [$cart->items->map(fn ($item) => [
            'content_id' => $item->content_id, 'quantity' => $item->quantity,
            'variant_id' => $item->variant_id, 'supplement_ids' => $item->supplement_ids ?? [],
        ])->all(), $cart];
    }

    private function rules(): array
    {
        return [
            'service' => ['required', Rule::in(['pickup', 'dine_in', 'delivery'])],
            'requested_at' => ['required', 'date'],
            'service_slot_id' => ['required', 'integer'],
            'delivery_address_id' => ['nullable', 'integer'],
            'items' => ['sometimes', 'array', 'min:1', 'max:30'],
            'items.*.content_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'items.*.variant_id' => ['nullable', 'integer'],
            'items.*.supplement_ids' => ['sometimes', 'array', 'max:10'],
            'items.*.supplement_ids.*' => ['integer', 'distinct'],
        ];
    }
}
