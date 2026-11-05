<?php
declare(strict_types=1);

final class Api
{
    public static function ok(mixed $data, string $message = 'Opération réussie', int $status = 200): never
    {
        self::send($status, ['success' => true, 'message' => $message, 'data' => $data, 'error' => null]);
    }

    public static function fail(int $status, string $code, string $message, mixed $details = null): never
    {
        self::send($status, ['success' => false, 'message' => $message, 'data' => null,
            'error' => ['code' => $code, 'details' => $details]]);
    }

    private static function send(int $status, array $body): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function body(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) self::fail(400, 'invalid_json', 'Le corps JSON est invalide.');
        return $data;
    }
}
