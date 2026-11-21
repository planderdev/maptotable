<?php
declare(strict_types=1);
// One blocking stylesheet, composed from the exact shared sources.
header('Content-Type: text/css; charset=UTF-8');
header('Vary: Accept-Encoding');
$tokens = require __DIR__ . '/../../app/design-tokens.php';
$css = ':root{';
foreach ($tokens as $group) foreach ($group as $name => $value) $css .= '--' . $name . ':' . $value . ';';
$css .= '}';
foreach (['fonts.css', 'vendor/swiper-bundle.min.css', 'vendor/aos.css', 'site.css', 'hero.css', 'menu.css', 'narrative.css', 'stories.css', 'program.css', 'aos-overrides.css'] as $file) $css .= file_get_contents(__DIR__ . '/' . $file);
if (str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip')) { $css = gzencode($css, 6); header('Content-Encoding: gzip'); }
header('Content-Length: ' . strlen($css));
echo $css;
