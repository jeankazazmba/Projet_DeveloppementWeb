<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\PlatformAudit;
use App\Support\PlatformAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PlatformProfileController extends Controller
{
    public function show(Request $request)
    {
        PlatformAccess::requireActiveAdmin($request);
        return $request->user()->only(['id', 'name', 'email', 'is_platform_admin', 'is_active']);
    }

    public function password(Request $request)
    {
        PlatformAccess::requireActiveAdmin($request);
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);
        if (!Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages(['current_password' => 'Mot de passe actuel incorrect.']);
        }
        DB::transaction(function () use ($request, $data) {
            $request->user()->update(['password' => $data['password']]);
            $request->user()->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();
            PlatformAudit::record($request->user(), 'platform.password_changed', 'user', (string) $request->user()->id);
        });
        return response()->noContent();
    }
}
