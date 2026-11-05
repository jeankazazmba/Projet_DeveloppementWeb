<?php
declare(strict_types=1);

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection) return self::$connection;
        $dsn = getenv('DB_DSN');
        if (!$dsn) throw new RuntimeException('DB_DSN doit être configuré.');
        self::$connection = new PDO($dsn, getenv('DB_USER') ?: '', getenv('DB_PASSWORD') ?: '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return self::$connection;
    }
}
