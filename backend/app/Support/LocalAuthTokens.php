<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LocalAuthTokens
{
    public static function passwordReset(User $user): void
    {
        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => hash('sha256', $token), 'created_at' => now()]
        );
        self::log('password_reset', $user, $token);
    }

    public static function emailVerification(User $user): void
    {
        $token = Str::random(64);
        DB::table('email_verification_tokens')->where('user_id', $user->id)->delete();
        DB::table('email_verification_tokens')->insert([
            'user_id' => $user->id, 'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHours(24), 'created_at' => now(), 'updated_at' => now(),
        ]);
        self::log('email_verification', $user, $token);
    }

    private static function log(string $purpose, User $user, string $token): void
    {
        // Aucun message n'est envoyé. Ces jetons ne sortent jamais de l'API.
        if (app()->environment(['local', 'testing'])) {
            Log::info('auth.local_token', ['purpose' => $purpose, 'email' => $user->email, 'token' => $token]);
        }
    }
}
