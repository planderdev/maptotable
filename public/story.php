<?php
require_once __DIR__ . '/../app/bootstrap.php';
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: 1;
$story = storyById($id);
if (!$story || $story['status'] !== 'published') {
    http_response_code(404); head('준비 중인 이야기', 'story'); siteHeader();
    ?><main class="container error-page" id="main"><h1><?= $story ? e($story['label']) . '는 준비 중입니다.' : '이야기를 찾을 수 없습니다.' ?></h1><?php button('목록으로 돌아가기', '/index.html#list'); ?></main><?php footer(); return;
}
$ready = array_values(array_filter($content['stories'], fn($s) => $s['status'] === 'published'));
$index = array_search($id, array_column($ready, 'id'), true);
$next = $ready[($index + 1) % count($ready)];
head($story['label'], 'story', $story['cover']); siteHeader();
?>
<main id="main">
    <section class="story-cover container"><a class="text-link back-link" href="/index.html#list">음식 이야기 목록</a><div class="story-cover-grid"><div class="story-cover-copy" data-aos="fade"><p>제주 신촌 주민의 음식 이야기</p><h1><?= e($story['label']) ?></h1><div class="story-unconfirmed"><p><?= e($story['name'] ?: '이름은 확인 뒤 넣습니다.') ?></p><p><?= e($story['food'] ?: '음식 이름은 확인 뒤 넣습니다.') ?></p></div><a class="text-link" href="#story-reading">음식 이야기 읽기</a></div><div class="story-cover-photo"><?php photo($story['cover'], '', true, $story['coverPosition']); ?></div></div></section>
    <section class="gallery-section section container" data-aos="fade-up" aria-label="주민의 사진"><?php photoCarousel($story); ?></section>
    <div class="story-reading container" id="story-reading"><section class="reading-section" data-aos="fade-up"><h2>영상</h2><?php emptyState('영상을 준비하고 있습니다.', '주민의 음식 이야기를 담은 영상이 들어갈 자리입니다.', 'video'); ?></section><section class="reading-section" data-aos="fade-up"><h2>음식 이야기</h2><?php emptyState('이야기 원고를 기다립니다.', '주민의 음식, 삶, 기억을 담은 이야기 원고가 들어갈 자리입니다. 원고를 받으면 그대로 옮깁니다.'); ?></section><section class="reading-section" data-aos="fade-up"><h2>해설</h2><?php emptyState('해설을 준비하고 있습니다.', '이 음식 이야기에 담긴 지역 식문화 해설이 들어갈 자리입니다.'); ?></section></div>
    <section class="story-join section container" data-aos="fade-up"><h2>이 음식 이야기를 읽고<br>떠오른 나의 비슷한 기억을<br>기록해 주세요.</h2><?php button('참여 입력 열기', '/join.html?id=' . $story['id']); ?></section>
    <section class="story-records container" data-aos="fade-up"><h2>참여 기록</h2><?php emptyState('아직 등록된 참여 기록이 없습니다.', '공개에 동의한 기록을 운영자가 검토한 뒤 여기에 등록합니다.'); ?></section>
    <section class="next-story container" data-aos="fade-up"><a href="/story.html?id=<?= $next['id'] ?>"><div><span>다음 이야기</span><h2><?= e($next['label']) ?></h2></div><?php photo($next['cover'], '', false, $next['coverPosition']); ?></a><a class="text-link back-link" href="/index.html#list">목록으로 돌아가기</a></section>
</main>
<?php footer(); ?>
