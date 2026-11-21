<?php
declare(strict_types=1);
const ROOT = __DIR__ . '/..';
$content = require __DIR__ . '/content.php';
$tokens = require __DIR__ . '/design-tokens.php';

function e(mixed $value): string { return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function icon(string $name, string $class = ''): string {
    if (!preg_match('/^[a-z-]+$/', $name)) return '';
    $file = ROOT . '/public/assets/vendor/icons/' . $name . '.svg';
    if (!is_file($file)) return '';
    return preg_replace('/<svg\b/', '<svg aria-hidden="true" focusable="false" class="icon ' . e($class) . '"', file_get_contents($file), 1) ?? '';
}
function asset(string $path): string { return '/' . ltrim($path, '/'); }
function storyById(int $id): ?array {
    global $content;
    foreach ($content['stories'] as $story) if ($story['id'] === $id) return $story;
    return null;
}
function ownerOf(string $photo): array {
    global $content;
    foreach ($content['stories'] as $story) if (in_array($photo, $story['photos'], true)) return $story;
    throw new RuntimeException('Unmapped photo: ' . $photo);
}
function head(string $title, string $page, ?string $preload = null): void {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    ?><!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title><?= e($title) ?> | MAP TO TABLE</title><meta name="description" content="제주 신촌 주민 6인의 음식, 삶, 기억을 사진과 영상, 글로 구성한 온라인 전시."><meta name="theme-color" content="#F5F5F2"><meta name="robots" content="noindex"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/unbounded-latin.woff2" as="font" type="font/woff2" crossorigin><?php if ($preload): ?><link rel="preload" as="image" href="/media/<?= e($preload) ?>.webp" imagesrcset="/media/s/<?= e($preload) ?>.webp 800w, /media/<?= e($preload) ?>.webp 1600w" imagesizes="<?= $page === 'home' ? '100vw' : '(max-width: 767px) 92vw, 65vw' ?>" fetchpriority="high"><?php endif; ?><link rel="stylesheet" href="/assets/styles.php"><script defer src="/assets/site.js"></script></head><body data-page="<?= e($page) ?>"><a class="skip-to-content" href="#main">본문으로 건너뛰기</a><?php
}
function siteHeader(string $active = ''): void { ?>
    <header class="site-header"><a class="wordmark" href="/index.html#top" aria-label="MAP TO TABLE 홈">MAP TO TABLE</a><nav class="desktop-nav" aria-label="주요 메뉴"><a href="/index.html#list">음식 이야기</a><a href="/index.html#join">참여</a><a href="/index.html#program">프로그램</a></nav><a class="header-join button button--primary" href="/join.html">나의 기억 기록하기</a><button class="menu-toggle icon-button" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mobile-menu"><?= icon('menu', 'menu-glyph') ?></button></header>
    <dialog class="mobile-menu" id="mobile-menu" aria-label="모바일 메뉴"><div class="menu-top"><a class="wordmark" href="/index.html#top" aria-label="MAP TO TABLE 홈">MAP TO TABLE</a><button class="menu-close icon-button" type="button" data-menu-close aria-label="메뉴 닫기" autofocus><?= icon('menu', 'menu-glyph') ?></button></div><nav aria-label="모바일 메뉴"><a href="/index.html#list">음식 이야기</a><a href="/index.html#join">참여</a><a href="/index.html#program">프로그램</a></nav></dialog>
    <noscript><nav class="nojs-navigation" aria-label="메뉴"><a href="/index.html#list">음식 이야기</a><a href="/index.html#join">참여</a><a href="/index.html#program">프로그램</a></nav></noscript>
<?php }
function footer(): void { global $content; ?>
    <footer class="site-footer container"><a class="footer-brand" data-aos="fade-up" href="/index.html#top">MAP TO TABLE</a><div class="footer-bottom" data-aos="fade-up" data-aos-delay="50"><p>딜리셔스라이프랩</p><div><p><?= e($content['footer']) ?></p><p><?= e($content['draft']) ?></p></div><a class="text-link" href="/design-system.php">디자인시스템</a></div></footer><div class="toast" role="status" aria-live="polite"></div></body></html>
<?php }
require __DIR__ . '/components.php';
