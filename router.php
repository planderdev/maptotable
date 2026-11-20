<?php
declare(strict_types=1);
// PHP development server router; production equivalents in public/.htaccess.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$routes = ['/' => 'index.php', '/index.html' => 'index.php', '/story.html' => 'story.php', '/join.html' => 'join.php', '/design-system' => 'design-system.php', '/design-system/' => 'design-system.php'];
if (isset($routes[$path])) { require __DIR__ . '/public/' . $routes[$path]; return true; }
$real = realpath(__DIR__ . '/public' . $path);
$root = realpath(__DIR__ . '/public');
if ($real !== false && str_starts_with($real, $root . DIRECTORY_SEPARATOR) && is_file($real)) {
    $types = ['css' => 'text/css', 'js' => 'application/javascript', 'svg' => 'image/svg+xml'];
    $ext = pathinfo($real, PATHINFO_EXTENSION);
    if (isset($types[$ext])) {
        header('Content-Type: ' . $types[$ext] . '; charset=UTF-8');
        header('Vary: Accept-Encoding');
        $data = file_get_contents($real);
        if (str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip')) {
            $data = gzencode($data, 6); header('Content-Encoding: gzip');
        }
        header('Content-Length: ' . strlen($data)); echo $data; return true;
    }
    return false;
}
http_response_code(404);
require __DIR__ . '/public/404.php';
