/* 참여 입력 시범 화면. 어디에도 보내거나 저장하지 않는다. 저장과 운영자 검토는 다음 단계에 붙인다. */
(function () {
  var D = window.LIKING;
  var root = document.getElementById('jp');
  var id = parseInt(new URLSearchParams(location.search).get('id'), 10);
  var from = D.people.filter(function (p) { return p.id === id && p.photos.length; })[0];
  var Q = D.questions, total = Q.length + 1, now = 0;

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };

  var html = '';
  if (from) {
    html += '<p class="jp-from"><img src="media/s/' + from.cover + '.jpg" alt="" style="object-position:' + from.coverPos + '">' +
      '<span>' + from.label + '에 남기는 기록</span></p>';
  }
  html += '<div class="jp-bar">' + new Array(total + 1).join('<i></i>') + '</div>';

  Q.forEach(function (q, i) {
    html +=
      '<section class="jp-step" data-step="' + i + '">' +
        '<span class="jp-no">0' + (i + 1) + ' / 0' + total + '</span>' +
        '<h1>' + q.ask + '</h1>' +
        '<p>' + q.title + '</p>' +
        '<textarea name="q' + i + '" aria-label="' + q.ask + '"></textarea>' +
        '<div class="jp-actions">' +
          (i ? '<button type="button" class="btn line" data-go="-1">이전</button>' : '') +
          '<button type="button" class="btn" data-go="1">다음</button>' +
        '</div>' +
      '</section>';
  });

  html +=
    '<section class="jp-step" data-step="' + Q.length + '">' +
      '<span class="jp-no">0' + total + ' / 0' + total + '</span>' +
      '<h1>공개 여부를 선택해 주세요.</h1>' +
      '<p>이름이나 연락처는 받지 않습니다.</p>' +
      '<div class="jp-choice">' +
        '<label><input type="radio" name="open" value="yes">전시에 공개합니다</label>' +
        '<label><input type="radio" name="open" value="no" checked>공개하지 않습니다</label>' +
      '</div>' +
      '<div class="jp-actions">' +
        '<button type="button" class="btn line" data-go="-1">이전</button>' +
        '<button type="button" class="btn" data-go="done">남기기</button>' +
      '</div>' +
      '<p class="note">공개에 동의한 기록만 운영자가 검토한 뒤 전시에 등록합니다. 고치거나 지워 달라는 요청은 운영자에게 알려 주세요.</p>' +
    '</section>' +

    '<section class="jp-step jp-done" data-step="done">' +
      '<span class="jp-no">시범 화면</span>' +
      '<h1>여기까지가<br>참여 입력의 흐름입니다.</h1>' +
      '<p>지금은 시범 화면이라 적은 내용을 어디에도 보내거나 저장하지 않았습니다.</p>' +
      '<div class="jp-recap" id="recap"></div>' +
      '<div class="jp-actions">' +
        '<a class="btn" href="' + (from ? 'story.html?id=' + from.id : 'index.html#list') + '">' + (from ? '이야기로 돌아가기' : '목록으로 돌아가기') + '</a>' +
      '</div>' +
    '</section>';

  root.innerHTML = html;

  var steps = Array.prototype.slice.call(root.querySelectorAll('.jp-step'));
  var bars = Array.prototype.slice.call(root.querySelectorAll('.jp-bar i'));
  function show(n) {
    now = n;
    steps.forEach(function (s) { s.classList.toggle('on', s.dataset.step === String(n)); });
    var k = n === 'done' ? total : n + 1;
    bars.forEach(function (b, i) { b.classList.toggle('on', i < k); });
    window.scrollTo(0, 0);
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b) return;
    if (b.dataset.go === 'done') {
      var open = root.querySelector('input[name="open"]:checked').value === 'yes';
      var lines = Q.map(function (q, i) {
        var v = root.querySelector('[name="q' + i + '"]').value.trim();
        return q.title + '\n' + (v || '(적지 않음)');
      });
      lines.push('공개 여부\n' + (open ? '전시에 공개' : '공개하지 않음'));
      document.getElementById('recap').innerHTML = esc(lines.join('\n\n'));
      show('done');
    } else {
      show(now + parseInt(b.dataset.go, 10));
    }
  });
  show(0);
})();
