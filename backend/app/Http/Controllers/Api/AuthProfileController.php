<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\LocalAuthTokens;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthProfileController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);
        $user = DB::transaction(function () use ($data) {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $user->studentProfile()->create(['phone' => $data['phone'] ?? null]);
            LocalAuthTokens::emailVerification($user);
            return $user;
        });
        return response()->json([
            'token' => $user->createToken('app')->plainTextToken,
            'user' => $this->profile($user),
            'restaurants' => [],
        ], 201);
    }

    public function me(Request $request)
    {
        return response()->json($this->profile($request->user()));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'expected_version' => ['nullable', 'integer', 'min:1'],
        ]);
        abort_if(!$request->exists('name') && !$request->exists('phone'), 422, 'Aucune modification fournie.');
        abort_if($request->exists('phone') && !$request->user()->studentProfile()->exists(), 403);
        $user = DB::transaction(function () use ($request, $data) {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            abort_if(isset($data['expected_version']) && $user->version !== $data['expected_version'], 409, 'Profil modifié. Rechargez-le.');
            if (array_key_exists('name', $data)) $user->name = $data['name'];
            $user->version++;
            $user->save();
            if (array_key_exists('phone', $data)) $user->studentProfile()->update(['phone' => $data['phone']]);
            return $user;
        });
        return response()->json($this->profile($user));
    }

    public function forgot(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $user = User::where('email', $data['email'])->where('is_active', true)->first();
        if ($user) LocalAuthTokens::passwordReset($user);
        return response()->json(['message' => 'Si ce compte existe, un jeton de réinitialisation a été créé dans le journal local.']);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'], 'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);
        DB::transaction(function () use ($data) {
            $record = DB::table('password_reset_tokens')->where('email', $data['email'])->lockForUpdate()->first();
            $valid = $record && hash_equals($record->token, hash('sha256', $data['token']))
                && Carbon::parse($record->created_at)->betweenIncluded(now()->subHour(), now());
            if (!$valid) throw ValidationException::withMessages(['token' => 'Jeton invalide ou expiré.']);
            $user = User::where('email', $data['email'])->where('is_active', true)->lockForUpdate()->first();
            if (!$user) throw ValidationException::withMessages(['token' => 'Jeton invalide ou expiré.']);
            $user->update(['password' => $data['password'], 'version' => $user->version + 1]);
            $user->tokens()->delete();
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
        });
        return response()->noContent();
    }

    public function requestVerification(Request $request)
    {
        if (!$request->user()->email_verified_at) LocalAuthTokens::emailVerification($request->user());
        return response()->json(['message' => 'Jeton créé dans le journal local si une vérification est nécessaire.']);
    }

    public function verifyEmail(Request $request)
    {
        $data = $request->validate(['token' => ['required', 'string']]);
        DB::transaction(function () use ($request, $data) {
            $record = DB::table('email_verification_tokens')->where('user_id', $request->user()->id)->lockForUpdate()->first();
            if (!$record || !hash_equals($record->token_hash, hash('sha256', $data['token'])) || now()->greaterThan($record->expires_at)) {
                throw ValidationException::withMessages(['token' => 'Jeton invalide ou expiré.']);
            }
            $request->user()->forceFill(['email_verified_at' => now()])->save();
            DB::table('email_verification_tokens')->where('user_id', $request->user()->id)->delete();
        });
        return response()->noContent();
    }

    private function profile(User $user): array
    {
        $student = $user->studentProfile;
        return [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'is_active' => $user->is_active, 'version' => $user->version,
            'account_type' => $user->is_platform_admin ? 'platform' : ($student ? 'student' : 'professional'),
            'phone' => $student?->phone,
            'restaurants' => $user->is_platform_admin || $student ? [] : $user->restaurants()
                ->wherePivot('is_active', true)->get(['restaurants.id', 'restaurants.name'])->map(fn ($restaurant) => [
                    'id' => $restaurant->id, 'name' => $restaurant->name, 'role' => $restaurant->pivot->role,
                ])->all(),
        ];
    }
}
