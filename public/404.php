<?php
require_once __DIR__ . '/../app/bootstrap.php';
head('페이지를 찾을 수 없습니다', 'error'); siteHeader();
?><main id="main" class="container error-page"><h1>페이지를 찾을 수 없습니다.</h1><p>주소를 확인하거나 음식 이야기 목록으로 돌아가 주세요.</p><?php button('목록으로 돌아가기', '/index.html#list'); ?></main><?php footer();
