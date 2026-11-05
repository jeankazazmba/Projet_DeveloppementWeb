<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PlatformAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', $credentials['email'])->first();
        if (!$user || !$user->is_active || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Identifiants incorrects.']);
        }

        if ($user->is_platform_admin) PlatformAudit::record($user, 'platform.login', 'user', (string) $user->id);

        return response()->json([
            'token' => $user->createToken('app')->plainTextToken,
            'user' => $user->only(['id', 'name', 'email', 'is_platform_admin', 'is_active']),
            'restaurants' => $user->is_platform_admin ? [] : $user->restaurants()->wherePivot('is_active', true)->get(['restaurants.id', 'name', 'location', 'hours', 'description', 'status', 'is_public', 'is_demo']),
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()->is_platform_admin) PlatformAudit::record($request->user(), 'platform.logout', 'user', (string) $request->user()->id);
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }
}
