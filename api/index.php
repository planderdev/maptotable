<?php
declare(strict_types=1);
// Vercel front controller. Mirrors router.php and public/.htaccess.
// Static files in public/ are served by Vercel before this runs; every other request lands here.
// Local equivalent: php -S 127.0.0.1:8080 -t public api/index.php

// Vercel compresses at the edge, so the PHP pages must not gzip their own output.
unset($_SERVER['HTTP_ACCEPT_ENCODING']);

$public = realpath(__DIR__ . '/../public');
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$routes = ['/' => 'index.php', '/index.html' => 'index.php', '/story.html' => 'story.php', '/join.html' => 'join.php', '/design-system' => 'design-system.php', '/design-system/' => 'design-system.php'];

$file = $routes[$path] ?? null;
if ($file === null) {
    $real = realpath($public . $path);
    if ($real !== false && str_starts_with($real, $public . DIRECTORY_SEPARATOR) && is_file($real)) {
        if (pathinfo($real, PATHINFO_EXTENSION) === 'php') $file = substr($real, strlen($public) + 1);
        elseif (PHP_SAPI === 'cli-server') return false; // local only: let the dev server send the static file
    }
}
if ($file === null || $file === '404.php') {
    http_response_code(404);
    $file = '404.php';
} else {
    // Pages depend only on the path and query, so the CDN may keep them until the next deployment.
    header('Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
}
require $public . '/' . $file;
