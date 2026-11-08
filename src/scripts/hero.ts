import { gsap, onPage, $, $$, reduced } from './core';

/**
 * Home hero: a tower is drawn floor by floor, then turns into a real photo,
 * then a slideshow of featured projects starts. The full intro plays once per
 * session; later visits jump straight to the finished state.
 * Without JS the finished state (photo + headline) is what the HTML shows.
 */
const NS = 'http://www.w3.org/2000/svg';
const FLOORS = 33, TOP = 150, BASE = 1330, STEP = (BASE - TOP) / FLOORS, SLIDE_S = 5.5;

onPage(() => {
  const hero = $('#hero');
  if (!hero) return;
  const caps: { title: string; sub: string; url: string }[] = JSON.parse(hero.dataset.caps || '[]');
  const slides = $$('.slide', hero);
  const bars = $$('#bars i span', hero);
  const capText = $('#capText', hero)!, caption = $<HTMLAnchorElement>('#caption', hero)!;

  const played = (() => { try { return sessionStorage.getItem('tsa-intro') === '1'; } catch { return false; } })();
  const instant = reduced() || played;

  // ---- build the drawing ----
  const floorsG = $('#floors', hero)!, ribsG = $('#ribs', hero)!;
  for (let i = 0; i < FLOORS; i++) {
    const y = BASE - STEP * (i + 1), l = document.createElementNS(NS, 'line');
    Object.entries({ x1: 300, x2: 800, y1: y, y2: y, class: 'floor' }).forEach(([k, v]) => l.setAttribute(k, String(v)));
    floorsG.appendChild(l);
  }
  [-114, -76, -38, 45, 90, 135].forEach((dx) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${497 + dx},90 L${497 + dx},780 C${500 + dx},880 ${560 + dx},920 ${560 + dx},1010 L${560 + dx},1330`);
    p.setAttribute('class', 'rib');
    ribsG.appendChild(p);
  });
  const prep = (el: SVGGeometryElement, fromEnd = false) => {
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(fromEnd ? -len : len);
    return el;
  };
  const ground = $<SVGLineElement>('#ground', hero)!;
  ground.style.strokeDasharray = '970'; ground.style.strokeDashoffset = '970';
  prep($<SVGPathElement>('#outline', hero)!);
  prep($<SVGPathElement>('#corner', hero)!, true);
  const ribs = [...ribsG.children].map((p) => prep(p as SVGPathElement, true));
  const floorEls = [...floorsG.children];
  const floorNo = $('#floorNo', hero)!, counter = { n: 0 };

  // ---- starting state (only now that JS runs) ----
  gsap.set('#revealRect', { attr: { y: 1352, height: 0 } });
  gsap.set('.hero-sky', { opacity: 0 });
  gsap.set('.hero-blueprint', { opacity: 1 });
  gsap.set('#lines', { opacity: 1 });
  gsap.set(['#shade', '#tag', '#ctas', '#caption'], { opacity: 0 });
  gsap.set('#h1 .w>span', { yPercent: 105 });
  gsap.set(['#counter', '#skip'], { opacity: 1, display: 'block' });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => {
    try { sessionStorage.setItem('tsa-intro', '1'); } catch { /* private mode */ }
    gsap.set('#skip', { display: 'none' });
    if (slides.length) fillBar(0);
  } });
  tl.to(ground, { strokeDashoffset: 0, duration: 0.7 }, 0.2)
    .from('#foot', { opacity: 0, duration: 0.4 }, 0.6)
    .to('#outline', { strokeDashoffset: 0, duration: 1.3 }, 0.7)
    .fromTo('#mast', { attr: { y1: 1330 } }, { attr: { y1: TOP - 60 }, duration: 1.9, ease: 'power1.inOut' }, 1.1)
    .fromTo('#jib', { attr: { transform: 'translate(0 1330)' }, opacity: 0 }, { attr: { transform: `translate(0 ${TOP - 60})` }, opacity: 1, duration: 1.9, ease: 'power1.inOut' }, 1.1)
    .to(ribs, { strokeDashoffset: 0, duration: 1.4, stagger: 0.06 }, 1.3)
    .to('#corner', { strokeDashoffset: 0, duration: 1.4 }, 1.2)
    .to(floorEls, { opacity: 0.85, duration: 0.12, stagger: 0.05, ease: 'none' }, 1.2)
    .to(counter, { n: FLOORS, duration: FLOORS * 0.05, ease: 'none', onUpdate: () => { floorNo.textContent = String(Math.round(counter.n)).padStart(2, '0'); } }, 1.2)
    .set('#scan', { opacity: 1 }, 3.0)
    .to('#revealRect', { attr: { y: 48, height: 1304 }, duration: 1.6, ease: 'power3.inOut' }, 3.0)
    .to('#scan', { attr: { y1: 48, y2: 48 }, duration: 1.6, ease: 'power3.inOut' }, 3.0)
    .to('.hero-sky', { opacity: 1, duration: 1.4 }, 3.1)
    .to('.hero-blueprint', { opacity: 0, duration: 1.2 }, 3.2)
    .to('#lines', { opacity: 0, duration: 1 }, 3.6)
    .to(['#scan', '#counter', '#skip'], { opacity: 0, duration: 0.5 }, 4.3)
    .to('#shade', { opacity: 1, duration: 1 }, 3.9)
    .to('#h1 .w>span', { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 4.0)
    .to(['#tag', '#ctas'], { opacity: 1, duration: 0.8, stagger: 0.15 }, 4.5)
    .to('#caption', { opacity: 1, duration: 0.6 }, 4.6);

  if (instant) tl.progress(1);
  $('#skip', hero)!.addEventListener('click', () => tl.timeScale(6));

  // ---- featured projects slideshow ----
  function fillBar(i: number) {
    gsap.fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: reduced() ? 0 : SLIDE_S, ease: 'none', onComplete: () => { if (!reduced()) nextSlide(i); } });
  }
  function nextSlide(i: number) {
    const n = (i + 1) % caps.length;
    if (n === 0) {
      bars.forEach((b) => gsap.set(b, { scaleX: 0 }));
      gsap.to(slides, { clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'power3.inOut' });
    } else {
      const s = slides[n - 1];
      gsap.set(s, { zIndex: n });
      gsap.fromTo(s, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.3, ease: 'power3.inOut' });
      gsap.fromTo(s, { scale: 1.12 }, { scale: 1, duration: 7, ease: 'power1.out' });
    }
    gsap.to(capText, { opacity: 0, y: 6, duration: 0.3, onComplete: () => {
      capText.innerHTML = '';
      const b = document.createElement('b'); b.textContent = caps[n].title;
      capText.append(b, `  ${caps[n].sub}`);
      caption.href = caps[n].url;
      gsap.to(capText, { opacity: 1, y: 0, duration: 0.4 });
    } });
    fillBar(n);
  }

  if (!reduced()) {
    gsap.to('#bld', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero .copy', { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }
});
