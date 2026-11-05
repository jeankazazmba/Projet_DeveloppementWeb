<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PlatformAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PlatformInvitationController extends Controller
{
    private function authorizePlatform(Request $request): void
    {
        abort_unless($request->user()->is_platform_admin && $request->user()->is_active, 403);
    }

    public function index(Request $request)
    {
        $this->authorizePlatform($request);
        return DB::table('platform_invitations')
            ->select('id', 'email', 'expires_at', 'created_at')
            ->whereNull('used_at')->where('expires_at', '>', now())
            ->orderByDesc('id')->limit(100)->get();
    }

    public function store(Request $request)
    {
        $this->authorizePlatform($request);
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);
        $email = mb_strtolower(trim($data['email']));
        if (User::whereRaw('LOWER(email) = ?', [$email])->exists()) {
            throw ValidationException::withMessages(['email' => 'Un compte utilise déjà cette adresse.']);
        }
        if (DB::table('platform_invitations')->where('email', $email)->whereNull('used_at')->where('expires_at', '>', now())->exists()) {
            throw ValidationException::withMessages(['email' => 'Une invitation active existe déjà pour cette adresse.']);
        }
        $token = Str::random(64);
        $id = DB::transaction(function () use ($request, $email, $token) {
            $id = DB::table('platform_invitations')->insertGetId([
                'email' => $email,
                'token_hash' => hash('sha256', $token),
                'invited_by' => $request->user()->id,
                'expires_at' => now()->addHours(48),
                'created_at' => now(), 'updated_at' => now(),
            ]);
            PlatformAudit::record($request->user(), 'platform.invitation_created', 'platform_invitation', (string) $id);
            return $id;
        });
        return response()->json(['id' => $id, 'email' => $email, 'token' => $token, 'expires_at' => now()->addHours(48)->toIso8601String()], 201);
    }

    public function destroy(Request $request, int $invitation)
    {
        $this->authorizePlatform($request);
        DB::transaction(function () use ($request, $invitation) {
            $row = DB::table('platform_invitations')->where('id', $invitation)->whereNull('used_at')->lockForUpdate()->first();
            abort_unless($row, 404);
            DB::table('platform_invitations')->where('id', $invitation)->delete();
            PlatformAudit::record($request->user(), 'platform.invitation_revoked', 'platform_invitation', (string) $invitation);
        });
        return response()->noContent();
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:64'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);
        $email = mb_strtolower(trim($data['email']));
        $user = DB::transaction(function () use ($data, $email) {
            $invitation = DB::table('platform_invitations')->where('token_hash', hash('sha256', $data['token']))->lockForUpdate()->first();
            if (!$invitation || $invitation->used_at || Carbon::parse($invitation->expires_at)->isPast() || $invitation->email !== $email || User::whereRaw('LOWER(email) = ?', [$email])->exists()) {
                throw ValidationException::withMessages(['token' => 'Invitation invalide, expirée ou déjà utilisée.']);
            }
            $user = User::create(['name' => trim($data['name']), 'email' => $email, 'password' => $data['password'], 'is_platform_admin' => true]);
            DB::table('platform_invitations')->where('id', $invitation->id)->update(['used_at' => now(), 'updated_at' => now()]);
            PlatformAudit::record($user, 'platform.invitation_accepted', 'platform_invitation', (string) $invitation->id);
            return $user;
        });
        return response()->json(['token' => $user->createToken('platform')->plainTextToken, 'user' => $user->only(['id', 'name', 'email', 'is_platform_admin', 'is_active']), 'restaurants' => []], 201);
    }
}
