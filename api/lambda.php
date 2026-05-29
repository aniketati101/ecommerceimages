<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$root = dirname(__DIR__);

/**
 * Vercel serverless: only /tmp is writable. Prepare dirs and defaults before Laravel boots.
 */
if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $tmp = '/tmp/laravel';

    foreach (
        [
            'storage/framework/cache/data',
            'storage/framework/sessions',
            'storage/framework/views',
            'storage/logs',
            'bootstrap/cache',
        ] as $dir
    ) {
        $path = "{$tmp}/{$dir}";
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }

    $defaults = [
        'APP_STORAGE_PATH' => "{$tmp}/storage",
        'VIEW_COMPILED_PATH' => "{$tmp}/storage/framework/views",
        'APP_CONFIG_CACHE' => "{$tmp}/bootstrap/cache/config.php",
        'APP_ROUTES_CACHE' => "{$tmp}/bootstrap/cache/routes.php",
        'APP_SERVICES_CACHE' => "{$tmp}/bootstrap/cache/services.php",
        'APP_PACKAGES_CACHE' => "{$tmp}/bootstrap/cache/packages.php",
        'CACHE_STORE' => 'array',
        'SESSION_DRIVER' => 'cookie',
        'QUEUE_CONNECTION' => 'sync',
        'LOG_CHANNEL' => 'stderr',
    ];

    foreach ($defaults as $key => $value) {
        if (getenv($key) === false) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }

    if (empty(getenv('APP_KEY')) && empty($_ENV['APP_KEY'] ?? null)) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Laravel APP_KEY is not set.\n\n";
        echo "Vercel → Project → Settings → Environment Variables → add APP_KEY.\n";
        echo "Generate locally: php artisan key:generate --show\n";
        exit(1);
    }
}

if (file_exists($maintenance = $root.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $root.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $root.'/bootstrap/app.php';

if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $storagePath = getenv('APP_STORAGE_PATH') ?: '/tmp/laravel/storage';
    $app->useStoragePath($storagePath);
}

$app->handleRequest(Request::capture());
