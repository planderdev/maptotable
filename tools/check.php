<?php
declare(strict_types=1);
$root = dirname(__DIR__);
$content = require $root . '/app/content.php';
$failures = [];
$assert = function(bool $condition, string $message) use (&$failures): void { if (!$condition) $failures[] = $message; };
$assert(count($content['stories']) === 6, 'Exactly six stories');
$published = array_filter($content['stories'], fn($s) => $s['status'] === 'published');
$assert(array_column($published, 'id') === [1,2,3], 'Published story IDs preserved');
$assert(count($content['sequence']) === 6, 'Six opening photos');
$owners = [];
foreach ($content['sequence'] as $photo) {
    $matches = array_filter($published, fn($s) => in_array($photo, $s['photos'], true));
    $assert(count($matches) === 1, 'Exactly one owner: ' . $photo);
    $owners[] = array_values($matches)[0]['id'] ?? 0;
}
$assert($owners === [1,1,2,2,3,3], 'Sequence mapping unchanged');
foreach ($content['photos'] as $id => $meta) {
    $assert(is_file($root . '/public/media/' . $id . '.jpg'), 'Original photo exists: ' . $id);
    $assert(is_file($root . '/public/media/s/' . $id . '.jpg'), 'Responsive photo exists: ' . $id);
    $assert($meta[3] !== '', 'Photo alt exists: ' . $id);
}
$assert(array_column($content['questions'], 'ask') === [
    '주민이 소개한 음식 가운데 무엇이 기억에 남았나요?',
    '그 음식에 담긴 돌봄, 일상, 계절 가운데 무엇이 보였나요?',
    '나에게도 비슷한 기억이 있나요?',
    '나의 음식 이야기를 기록해 주세요.',
], 'Questions verbatim and ordered');
$tokens = require $root . '/app/design-tokens.php';
$assert($tokens['primitive']['brand-orange'] === '#F0823A', 'Brand orange exact');
foreach (['index.php','story.php','join.php','design-system.php','.htaccess'] as $file) $assert(is_file($root . '/public/' . $file), 'Page exists: ' . $file);
foreach (['unbounded-latin.woff2','pretendard-variable.woff2'] as $font) $assert(filesize($root . '/public/assets/fonts/' . $font) > 10000, 'Local font exists: ' . $font);
if ($failures) { fwrite(STDERR, implode("\n",$failures)); exit(1); }
echo "Content mapping, exact questions, route files, brand tokens and local assets passed.\n";
