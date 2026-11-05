<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Payments\CashAdapter;
use App\Payments\SandboxStubAdapter;
use App\Support\StudentAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function methods()
    {
        return DB::table('payment_methods')->orderBy('id')->get(['code', 'label', 'provider', 'is_enabled'])
            ->map(fn ($method) => ['code' => $method->code, 'label' => $method->label,
                'available' => ($method->code === 'cash' && (bool) $method->is_enabled)
                    || ($method->code === 'sandbox_test' && app()->environment(['local', 'testing']) && config('payments.sandbox_enabled'))]);
    }

    public function index(Request $request, Order $order)
    {
        StudentAccess::require($request);
        abort_unless($order->user_id === $request->user()->id, 404);
        return PaymentIntent::where('order_id', $order->id)->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')->get(['id', 'order_id', 'status', 'provider', 'amount_cdf', 'currency', 'version', 'created_at']);
    }

    public function store(Request $request, Order $order)
    {
        StudentAccess::require($request);
        abort_unless($order->user_id === $request->user()->id, 404);
        $data = $request->validate(['method' => ['required', 'string', 'max:40']]);
        $key = $request->header('Idempotency-Key');
        if (!is_string($key) || !preg_match('/^[A-Za-z0-9._:-]{8,120}$/', $key)) {
            throw ValidationException::withMessages(['Idempotency-Key' => 'En-tête Idempotency-Key obligatoire.']);
        }
        $method = DB::table('payment_methods')->where('code', $data['method'])->first();
        $adapter = match (true) {
            $method?->code === 'cash' && $method->is_enabled => new CashAdapter(),
            $method?->code === 'sandbox_test' && app()->environment(['local', 'testing']) && config('payments.sandbox_enabled') => new SandboxStubAdapter(),
            default => null,
        };
        if (!$adapter) throw ValidationException::withMessages(['method' => 'Moyen de paiement non disponible.']);
        $hash = hash('sha256', $order->id.':'.$method->code);
        [$intent, $replayed] = DB::transaction(function () use ($request, $order, $method, $adapter, $key, $hash) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $existing = PaymentIntent::where('user_id', $request->user()->id)->where('idempotency_key', $key)->first();
            if ($existing) {
                abort_if($existing->request_hash !== $hash, 409, 'Clé déjà utilisée pour une autre intention.');
                return [$existing, true];
            }
            $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_if($lockedOrder->status === 'cancelled', 409, 'Commande annulée.');
            abort_if(PaymentIntent::where('order_id', $order->id)->whereIn('status', ['cash_due', 'pending', 'requires_action', 'paid'])->exists(), 409, 'Une intention active existe déjà pour cette commande.');
            $intent = PaymentIntent::create(['id' => 'PAY-'.Str::ulid(), 'order_id' => $order->id,
                'restaurant_id' => $order->restaurant_id, 'user_id' => $request->user()->id,
                'payment_method_id' => $method->id, 'provider' => $method->provider,
                'status' => $adapter->initialStatus(), 'amount_cdf' => $lockedOrder->amount_cdf,
                'idempotency_key' => $key, 'request_hash' => $hash]);
            $intent->events()->create(['provider' => $method->provider, 'event_id' => 'created:'.$intent->id,
                'from_status' => null, 'to_status' => $intent->status,
                'payload_hash' => $hash, 'intent_version' => 1, 'created_at' => now()]);
            return [$intent, false];
        });
        return response()->json($intent->only(['id', 'order_id', 'status', 'provider', 'amount_cdf', 'currency', 'version']), $replayed ? 200 : 201);
    }

    public function cancel(Request $request, PaymentIntent $intent)
    {
        StudentAccess::require($request);
        abort_unless($intent->user_id === $request->user()->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($intent, $data) {
            $locked = PaymentIntent::whereKey($intent->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            abort_unless(in_array($locked->status, ['cash_due', 'pending', 'requires_action'], true), 409);
            $before = $locked->status;
            $locked->update(['status' => 'cancelled', 'version' => $locked->version + 1]);
            $locked->events()->create(['provider' => $locked->provider, 'event_id' => 'student-cancel:'.$locked->id.':'.$locked->version,
                'from_status' => $before, 'to_status' => 'cancelled', 'payload_hash' => hash('sha256', $locked->id.':'.$locked->version),
                'intent_version' => $locked->version, 'created_at' => now()]);
        });
        return $intent->refresh()->only(['id', 'status', 'version']);
    }

    public function webhook(Request $request)
    {
        $secret = config('payments.test_webhook_secret');
        abort_unless(app()->environment(['local', 'testing']) && config('payments.sandbox_enabled') && is_string($secret) && strlen($secret) >= 32, 404);
        $timestamp = $request->header('X-Payment-Timestamp');
        $signature = $request->header('X-Payment-Signature');
        if (!is_string($timestamp) || !ctype_digit($timestamp) || abs(now()->timestamp - (int) $timestamp) > config('payments.webhook_tolerance_seconds')) abort(401, 'Signature invalide.');
        $expected = 'sha256='.hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);
        if (!is_string($signature) || !hash_equals($expected, $signature)) abort(401, 'Signature invalide.');
        $data = $request->validate(['event_id' => ['required', 'string', 'max:160'], 'intent_id' => ['required', 'string', 'max:80'],
            'status' => ['required', 'in:requires_action,paid,failed,cancelled'], 'external_reference' => ['nullable', 'string', 'max:160']]);
        $hash = hash('sha256', $request->getContent());
        return DB::transaction(function () use ($data, $hash) {
            $old = DB::table('payment_events')->where('provider', 'sandbox_stub')->where('event_id', $data['event_id'])->first();
            if ($old) {
                abort_if($old->payload_hash !== $hash || $old->payment_intent_id !== $data['intent_id'], 409, 'Identifiant d’événement réutilisé.');
                return ['status' => 'duplicate'];
            }
            $intent = PaymentIntent::whereKey($data['intent_id'])->lockForUpdate()->first();
            abort_unless($intent && in_array($intent->provider, ['cash', 'sandbox_stub'], true), 404);
            $allowed = match ($intent->status) {
                'pending' => ['requires_action', 'paid', 'failed', 'cancelled'],
                'requires_action' => ['paid', 'failed', 'cancelled'],
                'cash_due' => ['paid', 'cancelled'],
                default => [],
            };
            abort_unless(in_array($data['status'], $allowed, true), 409, 'Transition de paiement interdite.');
            $order = Order::whereKey($intent->order_id)->firstOrFail();
            abort_if($order->status === 'cancelled', 409, 'Commande annulée.');
            abort_if($intent->amount_cdf !== $order->amount_cdf, 409, 'Montant de commande modifié.');
            $before = $intent->status;
            $intent->update(['status' => $data['status'], 'external_reference' => $data['external_reference'] ?? null, 'version' => $intent->version + 1]);
            $intent->events()->create(['provider' => 'sandbox_stub', 'event_id' => $data['event_id'], 'from_status' => $before,
                'to_status' => $data['status'], 'payload_hash' => $hash, 'intent_version' => $intent->version, 'created_at' => now()]);
            return ['status' => 'processed', 'intent_status' => $intent->status];
        });
    }
}
