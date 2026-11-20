<?php
require_once __DIR__ . '/../app/bootstrap.php';
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: 0;
$from = storyById($id);
if ($from && $from['status'] !== 'published') $from = null;
head('나의 음식 기억 기록하기', 'join'); siteHeader();
?>
<main id="main" class="join-page container">
    <aside class="join-sidebar"><a class="text-link" href="<?= $from ? '/story.html?id=' . $from['id'] : '/index.html#join' ?>"><?= $from ? '이야기로 돌아가기' : '전시로 돌아가기' ?></a><h1 data-aos="fade-up">나의 음식<br>기억을 기록해<br>주세요.</h1><?php if ($from): ?><div class="join-context" data-aos="fade" data-aos-delay="50"><?php photo($from['cover'], '', false, $from['coverPosition']); ?><span><?= e($from['label']) ?>에 남기는 기록</span></div><?php endif; ?><p class="demo-notice"><span>참여 입력 시범 화면입니다.<br>작성 내용은 서버에 전송·저장되지 않습니다. 페이지를 닫거나 새로고침하면 사라집니다.</span></p></aside>
    <div class="join-form-wrap"><div class="join-progress" aria-label="참여 진행"><ol><?php foreach ([...array_column($content['questions'], 'title'), '공개 동의'] as $i => $label): ?><li <?= $i === 0 ? 'aria-current="step"' : '' ?>><span><?= $i + 1 ?></span><span class="sr-only"><?= e($label) ?></span></li><?php endforeach; ?></ol><p class="join-progress-text" aria-live="polite">1 / 5</p></div>
        <form class="join-form" data-story="<?= $from['id'] ?? '' ?>" data-demo="true">
        <?php foreach ($content['questions'] as $i => $q): ?>
            <section class="join-step" data-step="<?= $i ?>"><h2 tabindex="-1"><?= e($q['ask']) ?></h2><p class="join-question-type"><?= e($q['title']) ?></p><?php textareaField($i, $q['ask']); ?><div class="form-actions"><?php if ($i): button('이전', null, 'outline', '', 'data-step-back'); endif; button('다음', null, 'primary', '', 'data-step-next'); ?></div></section>
        <?php endforeach; ?>
            <section class="join-step" data-step="4"><h2 tabindex="-1">공개 여부를 선택해 주세요.</h2><p class="join-question-type">이름이나 연락처는 받지 않습니다.</p><?php consentChoice(); ?><p class="consent-note">공개에 동의한 기록만 운영자가 검토한 뒤 전시에 등록합니다. 고치거나 지워 달라는 요청은 운영자에게 알려 주세요.</p><div class="form-actions"><?php button('이전', null, 'outline', '', 'data-step-back'); button('작성 내용 확인', null, 'primary', '', 'data-form-finish'); ?></div></section>
            <section class="join-step join-done" data-step="done"><h2 tabindex="-1">여기까지가<br>참여 입력의 흐름입니다.</h2><p>지금은 시범 화면이라 적은 내용을 어디에도 보내거나 저장하지 않았습니다.</p><div class="join-recap"></div><div class="form-actions"><?php button('내용 다시 보기', null, 'outline', '', 'data-edit'); button('작성 내용 내려받기', null, 'primary', '', 'data-export'); ?></div><a class="text-link" href="<?= $from ? '/story.html?id=' . $from['id'] : '/index.html#list' ?>"><?= $from ? '이야기로 돌아가기' : '목록으로 돌아가기' ?></a></section>
        </form><noscript><style>.form-actions{display:none}</style><p class="demo-notice">JavaScript가 꺼져 있어 모든 질문을 한 화면에 표시합니다. 작성 내용은 전송·저장되지 않습니다.</p></noscript>
    </div>
</main>
<?php footer(); ?>
