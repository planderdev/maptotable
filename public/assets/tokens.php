<?php
declare(strict_types=1);
header('Content-Type: text/css; charset=UTF-8');
header('Cache-Control: public, max-age=3600');
$tokens = require __DIR__ . '/../../app/design-tokens.php';
echo ':root {';
foreach ($tokens as $group) foreach ($group as $key => $value) echo '--' . $key . ':' . $value . ';';
echo '}';
