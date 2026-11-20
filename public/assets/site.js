(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  let toastTimer;
  function toast(message) {
    const node = $('.toast');
    if (!node) return;
    node.textContent = message; node.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('is-visible'), 4000);
  }
  function menu() {
    const dialog = $('#mobile-menu'), toggle = $('.menu-toggle');
    if (!dialog || !toggle) return;
    toggle.addEventListener('click', () => { dialog.showModal(); toggle.setAttribute('aria-expanded', 'true'); });
    const close = () => dialog.close();
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    $('[data-menu-close]', dialog).addEventListener('click', close);
    $$('a', dialog).forEach(a => a.addEventListener('click', close));
    dialog.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); toggle.focus({ preventScroll: true }); });
  }
  function opening() {
    const wrap = $('.opening');
    if (!wrap) return;
    const scenes = $$('.hero-scene', wrap), progress = $('.hero-progress', wrap);
    const fill = $('.hero-progress-fill', wrap), title = $('.hero-title', wrap);
    let current = -1;
    function hydrate(index) {
      const scene = scenes[index];
      if (!scene) return;
      const template = $('template', scene);
      if (template) {
        scene.append(template.content.cloneNode(true)); template.remove();
        $('img', scene).loading = 'eager';
      }
    }
    function render(value) {
      const position = value * scenes.length;
      const index = Math.min(scenes.length - 1, Math.floor(position));
      const phase = Math.min(1, position - index);
      hydrate(index);
      const blend = Math.max(0, (phase - .7) / .3);
      if (blend > 0) hydrate(index + 1);
      if (current !== index) {
        current = index;
        wrap.dataset.currentScene = String(index);
        scenes.forEach((scene, i) => {
          scene.classList.toggle('is-active', i === index);
          scene.setAttribute('aria-hidden', String(i !== index));
        });
      }
      scenes.forEach((scene, i) => {
        const visible = i === index || (i === index + 1 && blend > 0);
        scene.style.visibility = visible ? 'visible' : 'hidden';
        scene.style.opacity = i === index ? '1' : i === index + 1 ? String(blend) : '0';
      });
      const image = $('img', scenes[index]);
      if (image) image.style.transform = `scale(${1.065 - phase * .065})`;
      const upcoming = scenes[index + 1] && $('img', scenes[index + 1]);
      if (upcoming) upcoming.style.transform = `scale(${1.065 - blend * .015})`;
      fill.style.transform = `scaleX(${value})`;
      progress.setAttribute('aria-valuenow', String(Math.round(value * 100)));
      title.style.transform = `translateY(${-value * 12}px)`;
    }
    hydrate(0);
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      wrap.classList.add('is-pinned');
      const trigger = ScrollTrigger.create({
        id: 'opening', trigger: wrap, start: 'top top',
        end: () => `+=${wrap.offsetHeight - $('.hero', wrap).offsetHeight}`,
        invalidateOnRefresh: true, onUpdate: self => render(self.progress),
        onRefresh: self => render(self.progress),
      });
      return () => {
        trigger.kill(); wrap.classList.remove('is-pinned'); current = -1;
        render(0); scenes.forEach(scene => $('img', scene)?.style.removeProperty('transform'));
        title.style.removeProperty('transform');
      };
    });
    cleanups.push(() => mm.revert());
  }
  function narrative() {
    const wrap = $('.intro-narrative');
    if (!wrap || !window.gsap || !window.ScrollTrigger) return;
    const stage = $('.intro-stage', wrap), lines = $$('.intro-mask-text', wrap);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      wrap.classList.add('is-pinned');
      gsap.set(lines, { opacity: .55, clipPath: 'inset(0 100% 0 0)' });
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'introduction', trigger: wrap, start: 'top top',
          end: () => `+=${wrap.offsetHeight - stage.offsetHeight}`, scrub: .45,
          invalidateOnRefresh: true,
          onUpdate: self => { wrap.dataset.progress = self.progress.toFixed(3); },
        },
      });
      timeline.to(lines, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: .44, stagger: .2, ease: 'none' }, 0)
        .to({}, { duration: .16 });
      return () => { wrap.classList.remove('is-pinned'); delete wrap.dataset.progress; };
    });
    cleanups.push(() => mm.revert());
  }
  function reading() {
    const wrap = $('.intro-reading-sequence');
    if (!wrap || !window.gsap || !window.ScrollTrigger) return;
    const stage = $('.intro-reading-stage', wrap), rows = $$('.intro-sentence', wrap);
    if (rows.length < 2) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      wrap.classList.add('is-pinned');
      gsap.set(rows, { xPercent: 100 });
      gsap.set(rows[0], { xPercent: 0 });
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'intro-reading', trigger: wrap,
          start: () => `top top+=${$('.site-header').offsetHeight}`,
          end: () => `+=${wrap.offsetHeight - stage.offsetHeight}`,
          scrub: .45, invalidateOnRefresh: true,
        },
      });
      timeline.to({}, { duration: .8 });
      rows.slice(1).forEach((row, i) => {
        const at = timeline.duration();
        timeline.to(rows[i], { xPercent: -100, duration: .6, ease: 'power1.inOut' }, at)
          .to(row, { xPercent: 0, duration: .6, ease: 'power1.inOut' }, at)
          .to({}, { duration: .8 });
      });
      return () => wrap.classList.remove('is-pinned');
    });
    cleanups.push(() => mm.revert());
  }
  function marquees() {
    $$('[data-marquee]').forEach(wrap => {
      let visible = false;
      const update = () => wrap.classList.toggle('is-running', visible && !document.hidden && !reduce.matches);
      const observer = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); update(); });
      wrap.classList.add('is-enhanced');
      observer.observe(wrap);
      document.addEventListener('visibilitychange', update);
      reduce.addEventListener('change', update);
      cleanups.push(() => { observer.disconnect(); document.removeEventListener('visibilitychange', update); reduce.removeEventListener('change', update); wrap.classList.remove('is-running', 'is-enhanced'); });
    });
  }
  function risingStories() {
    const section = $('.stories-rise');
    if (!section || !window.gsap || !window.ScrollTrigger) return;
    const cards = $$('.story-grid--rise .story-card', section);
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width:767px)' }, context => {
      if (!context.conditions.motion) return;
      const mobile = context.conditions.mobile;
      cards.forEach(card => {
        gsap.fromTo(card, { y: mobile ? 36 : 90 }, {
          y: mobile ? -28 : -110, ease: 'none',
          scrollTrigger: {
            id: `story-rise-${card.dataset.storyId}`, trigger: card,
            start: 'top bottom', end: 'bottom top', scrub: .45, invalidateOnRefresh: true,
          },
        });
      });
    });
    cleanups.push(() => mm.revert());
  }
  function carousels() {
    if (!window.Swiper) return;
    $$('[data-carousel]').forEach(block => {
      const element = $('.swiper', block), count = $('.carousel-count', block);
      const slides = $$('.swiper-slide', element);
      const isProgram = block.classList.contains('program-carousel--fullbleed');
      const edge = () => parseFloat(getComputedStyle($('.program-heading', block.closest('section'))).paddingLeft);
      const options = {
        slidesPerView: 'auto', spaceBetween: 24, speed: reduce.matches ? 0 : 420,
        grabCursor: true, loop: false, watchOverflow: true, preventClicks: true, preventClicksPropagation: true,
        navigation: { nextEl: $('.carousel-next', block), prevEl: $('.carousel-prev', block) },
        a11y: { enabled: true, prevSlideMessage: '이전 항목', nextSlideMessage: '다음 항목', firstSlideMessage: '첫 항목입니다', lastSlideMessage: '마지막 항목입니다', slideLabelMessage: '{{index}} / {{slidesLength}}', itemRoleDescriptionMessage: '슬라이드' },
        on: { slideChange: instance => { if (count) count.textContent = `${instance.activeIndex + 1} / ${slides.length}`; } },
      };
      if (isProgram) Object.assign(options, {
        spaceBetween: 16, slidesOffsetBefore: edge, slidesOffsetAfter: edge,
        breakpoints: { 768: { spaceBetween: 24 }, 1200: { spaceBetween: 40 } },
        freeMode: { enabled: true, momentum: !reduce.matches, momentumRatio: .6, sticky: false },
        simulateTouch: true, allowTouchMove: true, threshold: 8,
      });
      const swiper = new Swiper(element, options);
      element.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); swiper.slideNext(); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); swiper.slidePrev(); }
      });
      const change = () => { swiper.params.speed = reduce.matches ? 0 : 420; if (isProgram) swiper.params.freeMode.momentum = !reduce.matches; };
      reduce.addEventListener('change', change);
      cleanups.push(() => { reduce.removeEventListener('change', change); swiper.destroy(true, true); });
    });
  }
  function join() {
    const form = $('.join-form');
    if (!form) return;
    const steps = $$('.join-step', form), indicators = $$('.join-progress li');
    let current = 0, busy = false;
    form.classList.add('is-enhanced');
    function show(target, focus = true) {
      current = target;
      steps.forEach(step => { step.hidden = step.dataset.step !== String(target); });
      indicators.forEach((item, i) => {
        item.classList.toggle('is-complete', target === 'done' || i < target);
        if (i === target) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
      });
      $('.join-progress-text').textContent = target === 'done' ? '작성 내용 확인' : `${target + 1} / 5`;
      const heading = $(`.join-step[data-step="${target}"] h2`, form);
      if (focus) {
        heading.focus({ preventScroll: true });
        if (window.innerWidth < 768) $('.join-progress').scrollIntoView({ behavior: 'instant', block: 'start' });
        if (!reduce.matches) heading.parentElement.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    }
    form.addEventListener('submit', event => event.preventDefault());
    $$('textarea', form).forEach(field => field.addEventListener('input', () => {
      const counter = $('.field-count', field.parentElement);
      if (counter) counter.textContent = `${[...field.value].length.toLocaleString('ko-KR')}자`;
    }));
    $$('[data-step-next]', form).forEach(b => b.addEventListener('click', () => show(Math.min(4, current + 1))));
    $$('[data-step-back]', form).forEach(b => b.addEventListener('click', () => show(Math.max(0, current - 1))));
    $('[data-edit]', form).addEventListener('click', () => show(0));
    function entries() {
      return $$('textarea', form).map(field => [$(`label[for="${field.id}"]`, form).textContent, field.value.trim() || '(적지 않음)']).concat([['공개 여부', $('input[name="consent"]:checked', form).value === 'yes' ? '전시에 공개합니다' : '공개하지 않습니다']]);
    }
    $('[data-form-finish]', form).addEventListener('click', event => {
      if (busy) return;
      busy = true; event.currentTarget.disabled = true;
      const list = document.createElement('dl');
      for (const [question, answer] of entries()) {
        const dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = question; dd.textContent = answer; list.append(dt, dd);
      }
      $('.join-recap', form).replaceChildren(list);
      show('done'); busy = false; event.currentTarget.disabled = false;
    });
    $('[data-export]', form).addEventListener('click', () => {
      try {
        const text = 'MAP TO TABLE\n참여 입력 시범 화면의 작성 내용 (전송·저장되지 않음)\n\n' + entries().map(pair => pair.join('\n')).join('\n\n');
        const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = 'map-to-table-나의-음식-기억.txt'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); toast('작성 내용 파일을 내려받습니다.');
      } catch { toast('파일을 만들지 못했습니다. 내용을 유지했으니 다시 시도해 주세요.'); }
    });
    show(0, false);
  }
  function docs() {
    const root = $('.ds-layout');
    if (!root) return;
    const search = $('#ds-search'), results = $('.ds-search-results');
    const sections = $$('.ds-section');
    const links = $$('.ds-nav a');
    search.addEventListener('input', () => {
      const term = search.value.trim().toLowerCase();
      const matches = term ? sections.filter(s => `${s.dataset.search} ${$('h2', s)?.textContent}`.toLowerCase().includes(term)) : [];
      results.replaceChildren(); results.hidden = !term;
      if (term && !matches.length) results.textContent = '검색 결과가 없습니다.';
      for (const section of matches) {
        const a = document.createElement('a'); a.href = `#${section.id}`; a.textContent = $('h2', section).textContent;
        a.addEventListener('click', () => { results.hidden = true; search.value = ''; }); results.append(a);
      }
    });
    search.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); $('a', results)?.focus(); } if (e.key === 'Escape') { results.hidden = true; search.value = ''; } });
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) links.forEach(a => { if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    }, { rootMargin: '-100px 0px -65% 0px' });
    sections.forEach(s => observer.observe(s)); cleanups.push(() => observer.disconnect());
    $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
      try {
        const code = document.getElementById(button.dataset.copy).textContent;
        await navigator.clipboard.writeText(code); toast('코드를 복사했습니다.');
      } catch { toast('복사하지 못했습니다. 코드를 직접 선택해 복사해 주세요.'); }
    }));
    $$('.ds-nav a').forEach(a => a.addEventListener('click', () => { const details = $('.ds-mobile-contents'); if (details) details.open = false; }));
    $$('[data-demo-play]').forEach(button => button.addEventListener('click', () => {
      const block = button.closest('.motion-demo'), target = $('.motion-demo-target', block);
      const reduced = $('input', block).checked || reduce.matches;
      target.getAnimations().forEach(a => a.cancel());
      if (reduced) { target.style.transform = 'none'; target.style.opacity = '1'; toast('모션 감소: 이동 없이 즉시 표시합니다.'); }
      else target.animate([{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' });
    }));
    $$('[data-demo-reset]').forEach(button => button.addEventListener('click', () => {
      const target = $('.motion-demo-target', button.closest('.motion-demo'));
      target.getAnimations().forEach(a => a.cancel()); target.style.transform = ''; target.style.opacity = ''; toast('데모를 초기화했습니다.');
    }));
  }
  function video() {
    $$('[data-ambient]').forEach(wrap => {
      const video = $('video', wrap), button = $('.video-toggle', wrap);
      const autoplay = wrap.hasAttribute('data-autoplay');
      let visible = false, userPaused = false;
      // A deferred source prevents native autoplay from downloading an offscreen film.
      video.autoplay = false;
      video.muted = true;
      function loadSource() {
        const source = $('source[data-src]', video);
        if (source) { source.src = source.dataset.src; delete source.dataset.src; video.load(); }
      }
      async function play(automatic = false) {
        if (automatic && (!visible || document.hidden || reduce.matches || userPaused)) return;
        loadSource();
        try {
          await video.play();
          if (automatic && (!visible || document.hidden || reduce.matches || userPaused)) video.pause();
        } catch {
          // A blocked autoplay can still be started by tapping or using the keyboard.
          if (!automatic) toast('영상을 재생하지 못했습니다. 다시 시도해 주세요.');
        }
      }
      function syncPlayback() {
        video.autoplay = autoplay && !reduce.matches && !userPaused && visible && !document.hidden;
        if (!visible || document.hidden) video.pause();
        else if (video.autoplay) play(true);
      }
      function label() {
        if (button) button.textContent = video.paused ? '영상 재생' : '영상 일시정지';
        else video.setAttribute('aria-label', `${video.paused ? '정지된' : '재생 중인'} 바다 배경 영상. 클릭 또는 스페이스 키로 재생을 전환합니다.`);
      }
      function toggle() {
        if (video.paused) { userPaused = false; play(); }
        else { userPaused = true; video.autoplay = false; video.pause(); }
      }
      video.addEventListener('pause', label);
      video.addEventListener('play', label);
      if (button) button.addEventListener('click', toggle);
      else {
        video.addEventListener('click', toggle);
        video.addEventListener('keydown', event => { if (event.code === 'Space' || event.key === 'Enter') { event.preventDefault(); toggle(); } });
      }
      label();
      video.addEventListener('error', () => toast('영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'));
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && video.dataset.poster) { video.poster = video.dataset.poster; delete video.dataset.poster; }
          visible = entry.isIntersecting && entry.intersectionRatio >= .15;
          syncPlayback();
        }
      }, { threshold: [0, .15] });
      function motionChange() { if (reduce.matches) { video.autoplay = false; video.pause(); } else syncPlayback(); }
      document.addEventListener('visibilitychange', syncPlayback);
      reduce.addEventListener('change', motionChange);
      observer.observe(video);
      cleanups.push(() => {
        observer.disconnect(); video.autoplay = false; video.pause();
        document.removeEventListener('visibilitychange', syncPlayback);
        reduce.removeEventListener('change', motionChange);
      });
    });
  }
  function heroHeader() {
    const hero = $('.hero--immersive'), header = $('.site-header');
    if (!hero || !header) return;
    let frame;
    document.body.classList.add('has-hero-header');
    function update() {
      frame = null;
      const h = header.offsetHeight, cover = hero.getBoundingClientRect();
      header.classList.toggle('is-over-hero', cover.top <= h && cover.bottom > h);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('exhibition:ready', schedule);
    reduce.addEventListener('change', schedule);
    cleanups.push(() => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('exhibition:ready', schedule); reduce.removeEventListener('change', schedule); cancelAnimationFrame(frame); });
  }
  function scrollReveals() {
    if (!window.AOS || !$('[data-aos]')) return;
    const root = document.documentElement;
    let initialized = false;
    function refresh() { if (initialized && !reduce.matches) AOS.refresh(); }
    function activate() {
      if (reduce.matches) { root.classList.remove('aos-ready'); return; }
      if (!initialized) {
        AOS.init({ duration: 650, easing: 'ease-out-cubic', offset: 64, once: true, disableMutationObserver: true });
        initialized = true;
      }
      root.classList.add('aos-ready');
      AOS.refreshHard();
    }
    // Keyboard access never waits for a decorative entrance transition.
    function focus(event) { event.target.closest('[data-aos]')?.classList.add('aos-animate'); }
    activate();
    reduce.addEventListener('change', activate);
    document.addEventListener('focusin', focus);
    window.addEventListener('exhibition:ready', refresh);
    window.ScrollTrigger?.addEventListener('refresh', refresh);
    cleanups.push(() => {
      root.classList.remove('aos-ready');
      reduce.removeEventListener('change', activate);
      document.removeEventListener('focusin', focus);
      window.removeEventListener('exhibition:ready', refresh);
      window.ScrollTrigger?.removeEventListener('refresh', refresh);
    });
  }
  function safely(init) { try { init(); } catch (error) { console.error(`MAP TO TABLE: ${init.name}`, error); } }
  for (const init of [menu, join, docs, video, marquees, heroHeader]) safely(init);
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
  }
  async function enhanceExhibition() {
    const first = $('.hero-scene.is-active img') || $('.story-cover-photo img');
    await Promise.all([document.fonts.ready, first?.decode().catch(() => {})]);
    // Paint the actual exhibition before loading optional motion libraries.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      const needed = [];
      if ($('.opening')) needed.push(loadScript('/assets/vendor/gsap.min.js').then(() => loadScript('/assets/vendor/ScrollTrigger.min.js')));
      if ($('[data-carousel]')) needed.push(loadScript('/assets/vendor/swiper-bundle.min.js'));
      if ($('[data-aos]')) needed.push(loadScript('/assets/vendor/aos.js'));
      await Promise.all(needed);
    } catch { /* Native links, readable content and horizontal overflow remain usable. */ }
    safely(opening); safely(narrative); safely(reading); safely(risingStories); safely(carousels);
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
      if (location.hash && location.hash !== '#top') {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
      }
    }
    safely(scrollReveals);
    window.dispatchEvent(new Event('exhibition:ready'));
  }
  enhanceExhibition().catch(() => { safely(opening); safely(narrative); safely(reading); safely(risingStories); safely(carousels); });
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanups.forEach(cleanup => cleanup()); });
})();
