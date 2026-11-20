(function () {
  var D = window.LIKING;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var small = function (id) { return 'media/s/' + id + '.jpg'; };
  var big = function (id) { return 'media/' + id + '.jpg'; };
  var storyUrl = function (p) { return p.photos.length ? 'story.html?id=' + p.id : null; };
  var ownerOf = {};
  D.people.forEach(function (p) { p.photos.forEach(function (id) { ownerOf[id] = p; }); });

  /* ---------- 첫 화면: 스크롤하면 사진이 바뀐다 ---------- */
  var wrap = $('#herowrap'), seq = D.sequence, N = seq.length;
  var layers = [$('.slide.la'), $('.slide.lb')].map(function (el) {
    return { el: el, ph: $('.ph', el), mark: $('.mark', el), cut: $('.cut', el), id: null };
  });
  var front = 0, at = -1;
  var who = $('.who'), count = $('.count'), go = $('.go-story');
  var wide = window.matchMedia('(min-width: 900px)');

  /* 사진 한 장을 세 겹으로 채운다. 사진, 글자, 사람만 오려 낸 같은 사진 */
  function fill(layer, id) {
    var src = big(id), pos = D.focus[id], mask = 'url(media/cut/' + id + '.png)';
    layer.id = id;
    layer.ph.src = src; layer.ph.style.objectPosition = pos;
    layer.cut.src = src; layer.cut.style.objectPosition = pos;
    layer.cut.style.webkitMaskImage = mask; layer.cut.style.maskImage = mask;
    layer.cut.style.webkitMaskPosition = pos; layer.cut.style.maskPosition = pos;
    paintMark(layer);
  }
  function paintMark(layer) {
    if (!layer.id) return;
    var c = D.heroMarks[layer.id], v = wide.matches ? c.d : c.m;
    layer.mark.className = 'mark ' + c.cls;
    layer.mark.innerHTML = v.lines.join('<br>');
    layer.mark.style.setProperty('--fs', v.fs);
    layer.mark.style.setProperty('--y', v.y);
    layer.mark.style.setProperty('--mc', c.color);
  }
  var repaint = function () { layers.forEach(paintMark); };
  if (wide.addEventListener) wide.addEventListener('change', repaint); else wide.addListener(repaint);
  var ticks = $('.ticks');
  ticks.innerHTML = new Array(N + 1).join('<li><i></i></li>');
  var tickEls = $$('li', ticks);
  var fills = tickEls.map(function (li) { return li.firstChild; });
  var two = function (n) { return ('0' + n).slice(-2); };
  wrap.style.setProperty('--n', N);

  function show(n) {
    var first = at < 0, down = n > at;
    at = n;
    var id = seq[at], p = ownerOf[id];
    front = 1 - front;
    var inc = layers[front], out = layers[1 - front];
    fill(inc, id);
    inc.el.style.zIndex = 2; out.el.style.zIndex = 1;
    inc.el.classList.remove('in-down', 'in-up');
    if (!first) { void inc.el.offsetWidth; inc.el.classList.add(down ? 'in-down' : 'in-up'); }

    if (who.textContent !== p.label) {
      who.textContent = p.label;
      who.classList.remove('pop');
      if (!first) { void who.offsetWidth; who.classList.add('pop'); }
    }
    count.textContent = two(at + 1) + ' / ' + two(N);
    go.href = storyUrl(p);
    go.setAttribute('aria-label', p.label + ' 보기');
  }

  /* 스크롤 위치를 사진 번호와 진행 막대로 바꾼다 */
  var waiting = false;
  function sync() {
    waiting = false;
    var r = wrap.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
    var pos = Math.min(p * N, N - 0.0001);
    var idx = Math.floor(pos), frac = pos - idx;
    if (idx !== at) show(idx);
    fills.forEach(function (el, k) {
      el.style.width = k < idx ? '100%' : (k === idx ? (frac * 100).toFixed(1) + '%' : '0');
    });
  }
  function onScroll() { if (!waiting) { waiting = true; requestAnimationFrame(sync); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  sync();

  /* 스크롤이 빨라도 빈 화면이 나오지 않게 큰 사진을 차례로 미리 받아 둔다 */
  window.addEventListener('load', function () {
    var k = 1;
    (function next() {
      if (k >= N) return;
      var im = new Image(), mk = new Image();
      im.onload = im.onerror = next;
      mk.src = 'media/cut/' + seq[k] + '.png';
      im.src = big(seq[k]); k += 1;
    })();
  });

  /* ---------- 목록 ---------- */
  $('#rows').innerHTML = D.people.map(function (p) {
    var url = storyUrl(p);
    var inner =
      '<span class="no">' + ('0' + p.id).slice(-2) + '</span>' +
      '<div><h3>' + p.label + '</h3><p>' + (url ? (p.food || '신촌 주민의 음식 이야기') : '준비 중') + '</p></div>' +
      '<div class="th">' + (url ? '<img src="' + small(p.cover) + '" alt="" style="object-position:' + p.coverPos + '">' : '') + '</div>';
    return '<li class="row' + (url ? '' : ' wait') + '" style="--pc:' + p.color + '">' +
      (url ? '<a href="' + url + '">' + inner + '</a>' : '<div>' + inner + '</div>') + '</li>';
  }).join('');

  /* ---------- 참여 안내 ---------- */
  $('#qs').innerHTML = D.questions.map(function (q, i) { return '<li><span>0' + (i + 1) + '</span>' + q.title + '</li>'; }).join('');

  /* ---------- 나타나기 ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
