<?php
declare(strict_types=1);
function button(string $label, ?string $href = null, string $variant = 'primary', string $arrow = '', string $attrs = ''): void {
    $tag = $href === null ? 'button' : 'a';
    ?><<?= $tag ?> class="button button--<?= e($variant) ?>" <?= $href === null ? 'type="button"' : 'href="' . e($href) . '"' ?> <?= $attrs ?>><?= e($label) ?><?= $arrow ? icon($arrow) : '' ?></<?= $tag ?>><?php
}
function photo(string $id, string $class = '', bool $priority = false, ?string $position = null, string $sizes = '(max-width: 767px) 92vw, 65vw'): void {
    global $content;
    $meta = $content['photos'][$id] ?? null;
    if (!$meta || !is_file(ROOT . '/public/media/' . $id . '.jpg')) {
        emptyState('사진을 준비하고 있습니다.', '사진이 제공되면 이 자리에 표시합니다.', 'image');
        return;
    }
    $dimensions = getimagesize(ROOT . '/public/media/' . $id . '.jpg');
    $small = getimagesize(ROOT . '/public/media/s/' . $id . '.jpg');
    $format = is_file(ROOT . '/public/media/' . $id . '.webp') ? 'webp' : 'jpg';
    ?><img class="responsive-image <?= e($class) ?>" src="/media/<?= e($id) ?>.<?= $format ?>" srcset="/media/s/<?= e($id) ?>.<?= $format ?> <?= $small[0] ?>w, /media/<?= e($id) ?>.<?= $format ?> <?= $dimensions[0] ?>w" sizes="<?= e($sizes) ?>" width="<?= $dimensions[0] ?>" height="<?= $dimensions[1] ?>" alt="<?= e($meta[3]) ?>" <?= $priority ? 'fetchpriority="high"' : 'loading="lazy"' ?> decoding="async" style="--photo-focus:<?= e($position ?? $meta[1]) ?>;--photo-focus-mobile:<?= e($meta[2]) ?>"><?php
}
function storyCard(array $story, bool $rising = false): void {
    $open = $story['status'] === 'published';
    ?><article class="story-card <?= $open ? '' : 'story-card--pending' ?>" data-story-id="<?= $story['id'] ?>" data-status="<?= e($story['status']) ?>"><?php if ($open): ?><a class="story-card-link" data-aos="fade" href="/story.html?id=<?= $story['id'] ?>"><div class="story-card-image"><?php photo($story['cover'], '', false, $story['coverPosition'], $rising ? '(max-width:767px) 73vw, 28vw' : '(max-width:767px) 92vw, 65vw'); ?></div><div class="story-card-info"><h3><?= e($story['label']) ?></h3><p>신촌 주민의 음식 이야기</p></div></a><?php else: ?><div class="story-pending-mark" aria-hidden="true"><?= sprintf('%02d', $story['id']) ?></div><div class="story-card-info"><h3><?= e($story['label']) ?></h3><span class="status-badge">준비 중</span></div><?php endif; ?></article><?php
}
function programCard(array $program, int $i): void { ?>
    <article class="program-card program-card--visual" data-aos="fade-up" data-aos-delay="<?= $i * 50 ?>"><img class="program-card-photo" src="/assets/images/programs/<?= e($program['image']) ?>-480.webp" srcset="/assets/images/programs/<?= e($program['image']) ?>-480.webp 480w, /assets/images/programs/<?= e($program['image']) ?>-960.webp 960w" sizes="(max-width:767px) 82vw, (max-width:1200px) 32vw, 24vw" width="960" height="1280" alt="" loading="lazy" decoding="async"><span class="program-number" aria-hidden="true"><?= $i + 1 ?></span><div class="program-card-copy"><h3><?= e($program['title']) ?></h3><p><?= e($program['body']) ?></p><span class="program-audience"><?= e($program['audience']) ?></span></div></article>
<?php }
function carouselControls(string $label, int $total): void { if ($total < 2) return; ?>
    <div class="carousel-controls"><span class="carousel-count" aria-live="polite">1 / <?= $total ?></span><div><button class="icon-button carousel-prev" type="button" aria-label="<?= e($label) ?> 이전"><?= icon('arrow-left') ?></button><button class="icon-button carousel-next" type="button" aria-label="<?= e($label) ?> 다음"><?= icon('arrow-right') ?></button></div></div>
<?php }
function photoCarousel(array $story, string $id = 'photos'): void { global $content; ?>
    <div class="carousel-block photo-carousel" data-carousel><div class="swiper" id="<?= e($id) ?>" tabindex="0" role="region" aria-roledescription="캐러셀" aria-label="<?= e($story['label']) ?> 사진"><div class="swiper-wrapper"><?php foreach ($story['photos'] as $photo): ?><figure class="swiper-slide photo-slide <?= $content['photos'][$photo][0] === 'P' ? 'photo-slide--portrait' : '' ?>"><?php photo($photo); ?></figure><?php endforeach; ?></div></div><?php carouselControls('사진', count($story['photos'])); ?></div>
<?php }
function emptyState(string $title, string $body, string $glyph = ''): void { ?>
    <div class="empty-state"><div><h3><?= e($title) ?></h3><p><?= e($body) ?></p></div></div>
<?php }
function textareaField(int $i, string $question, string $extra = ''): void { ?>
    <label class="sr-only" for="q<?= $i ?>"><?= e($question) ?></label><textarea class="field" id="q<?= $i ?>" name="q<?= $i ?>" rows="6" aria-describedby="q<?= $i ?>-hint q<?= $i ?>-error" <?= $extra ?>></textarea><div class="field-meta"><p id="q<?= $i ?>-hint">빈칸으로 두어도 다음으로 넘어갈 수 있습니다.</p><span class="field-count" aria-hidden="true">0자</span></div><p class="field-error" id="q<?= $i ?>-error" hidden></p>
<?php }
function consentChoice(string $prefix = ''): void { ?>
    <fieldset class="consent-choices"><legend class="sr-only">공개 여부</legend><label class="consent-option"><input type="radio" name="<?= e($prefix) ?>consent" value="yes"><span><strong>전시에 공개합니다</strong><small>운영자 검토 후 전시에 등록합니다.</small></span></label><label class="consent-option"><input type="radio" name="<?= e($prefix) ?>consent" value="no" checked><span><strong>공개하지 않습니다</strong><small>전시에 공개하지 않습니다.</small></span></label></fieldset>
<?php }
function ambientVideo(string $id = 'ambient-sea', bool $immersive = false): void { ?>
    <section class="media-interlude <?= $immersive ? 'media-interlude--immersive' : '' ?>" <?= $immersive ? 'id="film" aria-labelledby="' . e($id) . '-title"' : 'aria-label="배경 영상"' ?>><div class="ambient-video" data-ambient <?= $immersive ? 'data-autoplay' : '' ?>><video id="<?= e($id) ?>" <?= $immersive ? 'autoplay' : '' ?> muted playsinline loop <?= $immersive ? 'tabindex="0"' : '' ?> preload="none" data-poster="/assets/video/sea-waves-poster.webp" aria-label="전시 배경용 바다 풍경 영상"><source <?= $immersive ? 'data-src' : 'src' ?>="/assets/video/sea-waves-pixabay.mp4" type="video/mp4"><track kind="captions" src="/assets/video/sea-waves.ko.vtt" srclang="ko" label="장면 설명"></video><?php if ($immersive): ?><div class="video-shade" aria-hidden="true"></div><h2 class="video-statement" data-aos="fade" data-aos-anchor-placement="center-bottom" id="<?= e($id) ?>-title"><span>주민의 이야기와</span><span>참여자의 기억이 함께 쌓입니다.</span></h2><?php endif; ?><?php if (!$immersive): ?><button class="video-toggle" type="button" aria-controls="<?= e($id) ?>">영상 재생</button><?php endif; ?><?php if ($immersive): ?><noscript><a class="video-fallback" href="/assets/video/sea-waves-pixabay.mp4">영상 열기</a></noscript><?php endif; ?></div></section>
<?php }
