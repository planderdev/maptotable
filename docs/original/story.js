(function () {
  var D = window.LIKING;
  var q = new URLSearchParams(location.search);
  var ready = D.people.filter(function (p) { return p.photos.length; });
  var id = parseInt(q.get('id'), 10);
  var p = ready.filter(function (x) { return x.id === id; })[0] || ready[0];
  var next = ready[(ready.indexOf(p) + 1) % ready.length];

  var big = function (i) { return 'media/' + i + '.jpg'; };
  var no = ('0' + p.id).slice(-2);
  var joinUrl = 'join.html?id=' + p.id;

  document.documentElement.style.setProperty('--pc', p.color);
  document.documentElement.style.setProperty('--pon', p.onColor);
  document.getElementById('tojoin').href = joinUrl;

  var strip = p.photos.map(function (i) {
    return '<figure class="' + D.photos[i] + '"><img src="' + big(i) + '" alt="" loading="lazy"></figure>';
  }).join('');

  document.getElementById('story').innerHTML =
    '<section class="st-hero">' +
      '<div class="cover"><img src="' + big(p.cover) + '" alt="" style="object-position:' + p.coverPos + '"></div>' +
      '<div class="st-title">' +
        '<span class="no">제주 신촌 주민의 음식 이야기</span>' +
        '<h1>' + p.label + '</h1>' +
        '<p>' + (p.name || '이름은 확인 뒤 넣습니다.') + '</p>' +
        '<span class="st-chip">' + (p.food || '음식 이름은 확인 뒤 넣습니다.') + '</span>' +
      '</div>' +
    '</section>' +

    '<div class="st-strip">' + strip + '</div>' +
    '<p class="note st-swipe">사진을 옆으로 넘겨 보세요.</p>' +

    '<section class="st-block">' +
      '<h2>영상</h2>' +
      '<div class="st-video">영상을 준비하고 있습니다.</div>' +
    '</section>' +

    '<section class="st-block">' +
      '<h2>음식 이야기</h2>' +
      '<div class="empty">주민의 음식, 삶, 기억을 담은 이야기 원고가 들어갈 자리입니다. 원고를 받으면 그대로 옮깁니다.</div>' +
    '</section>' +

    '<section class="st-block">' +
      '<h2>해설</h2>' +
      '<div class="empty">이 음식 이야기에 담긴 지역 식문화 해설이 들어갈 자리입니다.</div>' +
    '</section>' +

    '<section class="st-q">' +
      '<p class="kicker" style="color:inherit;opacity:.75">참여</p>' +
      '<h2>이 음식 이야기를 읽고<br>떠오른 나의 비슷한 기억을<br>기록해 주세요.</h2>' +
      '<a class="btn" href="' + joinUrl + '">참여 입력 열기</a>' +
    '</section>' +

    '<section class="st-block">' +
      '<h2>참여 기록</h2>' +
      '<div class="empty">아직 등록된 참여 기록이 없습니다. 공개에 동의한 기록을 운영자가 검토한 뒤 여기에 등록합니다.</div>' +
    '</section>' +

    '<a class="st-next" href="story.html?id=' + next.id + '">' +
      '<img src="' + big(next.cover) + '" alt="" style="object-position:' + next.coverPos + '">' +
      '<div><small>다음 이야기</small><strong>' + next.label + '</strong></div>' +
    '</a>' +
    '<a class="back" href="index.html#list">목록으로 돌아가기</a>';
})();
