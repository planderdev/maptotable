<?php
require_once __DIR__ . '/../app/bootstrap.php';
head('제주 신촌 주민의 음식 이야기', 'home', '64A9115');
siteHeader();
?>
<main id="main">
    <div class="opening" id="top">
        <section class="hero hero--immersive" aria-label="주민의 음식 이야기 전시">
            <div class="hero-visual">
                <?php foreach ($content['sequence'] as $i => $image): $owner = ownerOf($image); ?>
                    <figure class="hero-scene <?= $i === 0 ? 'is-active' : '' ?>" data-owner="<?= $owner['id'] ?>" data-photo="<?= e($image) ?>" <?= $i ? 'aria-hidden="true"' : '' ?>><?php if ($i): ?><template><?php photo($image, '', false, null, '100vw'); ?></template><?php else: photo($image, '', true, null, '100vw'); endif; ?></figure>
                <?php endforeach; ?>
            </div>
            <div class="hero-shade" aria-hidden="true"></div>
            <div class="hero-content">
                <h1 class="hero-title"><span>MAP</span> <span>TO</span> <span>TABLE</span></h1>
                <p class="hero-subcopy">제주 신촌의 음식, 삶, 기억을 담은 온라인 전시.</p>
                <div class="hero-progress" role="progressbar" aria-label="오프닝 사진 진행" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="hero-progress-fill"></span></div>
            </div>
        </section>
    </div>
    <section class="intro-narrative" id="say" aria-labelledby="intro-title">
        <div class="intro-stage">
            <h2 class="intro-statement" id="intro-title"><?php foreach (['제주의 음식에는', '사람들의 삶과 계절,', '기억이 담겨 있습니다.'] as $line): ?><span class="intro-mask"><span class="intro-mask-base" aria-hidden="true"><?= e($line) ?></span><span class="intro-mask-text"><?= e($line) ?></span></span><?php endforeach; ?></h2>
        </div>
    </section>
    <section class="intro intro-reading" id="introduction" aria-label="전시 소개">
        <?php $sentences = array_merge(preg_split('/(?<=[.!?])\s+/u', $content['intro']['body']) ?: [], [$content['intro']['operator']]); ?>
        <div class="intro-reading-sequence"><div class="intro-reading-stage"><?php foreach ($sentences as $sentence): ?><div class="intro-sentence"><div class="intro-sentence-inner"><p class="intro-sentence-text"><?= e($sentence) ?></p></div></div><?php endforeach; ?></div></div>
        <div class="photo-marquee" tabindex="0" role="region" aria-label="주민 사진 모음. 마우스를 올리거나 키보드 초점을 두면 움직임이 멈춥니다." data-marquee><div class="photo-marquee-track"><?php for ($copy = 0; $copy < 2; $copy++): ?><div class="photo-marquee-group" <?= $copy ? 'aria-hidden="true" inert' : '' ?>><?php foreach ($content['sequence'] as $image): ?><figure class="photo-marquee-item"><?php photo($image, '', false, null, '(max-width:767px) 220px, 28vw'); ?></figure><?php endforeach; ?></div><?php endfor; ?></div></div>
        <div class="intro-reading-actions container"><?php button('음식 이야기 둘러보기', '#list', 'primary'); ?></div>
    </section>
    <?php ambientVideo('ambient-sea', true); ?>
    <section class="stories-section stories-rise" id="list" aria-labelledby="stories-title">
        <div class="stories-exhibition">
            <div class="stories-title-layer"><div class="section-heading"><h2 id="stories-title"><span>음식</span><span>삶</span><span>기억</span></h2></div></div>
            <div class="story-grid story-grid--rise container"><?php foreach ($content['stories'] as $story) if ($story['status'] === 'published') storyCard($story, true); ?></div>
        </div>
    </section>
    <section class="join-invitation section" id="join"><div class="container join-invitation-grid"><div data-aos="fade-up"><h2>나의 음식 기억을<br>기록해 주세요.</h2><?php button('참여 입력 열기', '/join.html', 'dark'); ?><p class="join-note">현장에서는 QR로 들어옵니다.<br>공개에 동의한 기록만 운영자가 검토한 뒤 전시에 등록합니다.</p></div><ol class="question-list"><?php foreach ($content['questions'] as $i => $q): ?><li data-aos="fade-up" data-aos-delay="<?= $i * 50 ?>"><span><?= sprintf('%02d', $i + 1) ?></span><h3><?= e($q['title']) ?></h3></li><?php endforeach; ?></ol></div></section>
    <section class="program-section program-section--immersive section" id="program" aria-labelledby="program-title"><div class="section-heading program-heading" data-aos="fade-up"><h2 id="program-title">전시의 이야기를<br>현장의 해설과 음식 경험으로 잇습니다.</h2></div><div class="carousel-block program-carousel program-carousel--fullbleed" data-carousel><div class="swiper" tabindex="0" role="region" aria-roledescription="캐러셀" aria-label="연계 프로그램"><div class="swiper-wrapper"><?php foreach ($content['programs'] as $i => $program): ?><div class="swiper-slide"><?php programCard($program, $i); ?></div><?php endforeach; ?></div></div><div class="program-controls"><?php carouselControls('프로그램', count($content['programs'])); ?></div></div><p class="section-note program-note" data-aos="fade">프로그램별 일정, 장소, 구성, 참가비, 예약 방법은 정해지는 대로 안내합니다.</p></section>
</main>
<?php footer(); ?>
