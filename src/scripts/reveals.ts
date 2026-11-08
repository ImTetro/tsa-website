import { gsap, ScrollTrigger, onPage, $, $$, reduced, canHover } from './core';

/** Site-wide scroll animations. Everything is visible without JS; these only add motion. */
onPage(() => {
  if (reduced()) { (window as any).__tsaReady = true; return; }

  // headings: words rise in
  $$('.split').forEach((h) => {
    if (!h.querySelector('.w')) {
      h.innerHTML = h.innerHTML
        .split(/(<br\s*\/?>)/)
        .map((part) => (/^<br/.test(part) ? part : part.split(/\s+/).filter(Boolean).map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')))
        .join('');
    }
    gsap.to(h.querySelectorAll('.w>span'), { y: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  // generic fade-up
  $$('[data-reveal]').forEach((el) => {
    const kids = el.dataset.reveal === 'children' ? [...el.children] : [el];
    gsap.from(kids, { opacity: 0, y: 32, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // statement: words fill in as you scroll
  $$('[data-fill]').forEach((p) => {
    p.innerHTML = (p.textContent || '').trim().split(/\s+/).map((w) => `<span class="wd">${w}</span>`).join(' ');
    gsap.fromTo(p.querySelectorAll('.wd'), { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 78%', end: 'bottom 45%', scrub: true } });
  });

  // facts: count up + line draws
  $$('.fact').forEach((f, i) => {
    const b = f.querySelector<HTMLElement>('b[data-to]');
    ScrollTrigger.create({ trigger: f, start: 'top 90%', once: true, onEnter: () => {
      setTimeout(() => f.classList.add('on'), i * 120);
      if (!b) return;
      const to = +b.dataset.to!, from = +(b.dataset.from || 0), o = { v: from };
      gsap.to(o, { v: to, duration: 1.8, delay: i * 0.12, ease: 'power2.out', onUpdate: () => { b.textContent = String(Math.round(o.v)); } });
    } });
  });

  // project cards: rise + inner parallax
  $$('.card').forEach((c) => {
    gsap.fromTo(c, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.out', clearProps: 'clipPath', scrollTrigger: { trigger: c, start: 'top 92%' } });
    const ph = c.querySelector('.ph');
    if (ph) gsap.fromTo(ph, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // page hero image: slow zoom-out + parallax
  const heroImg = $('.page-hero .bg');
  if (heroImg) {
    gsap.fromTo(heroImg, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    gsap.to(heroImg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // scroll-driven colour blend between a light section and the next dark one
  $$('[data-blend-to]').forEach((dark) => {
    const light = dark.previousElementSibling as HTMLElement | null;
    const from = dark.dataset.blendFrom || '#E6E6E6', to = dark.dataset.blendTo!;
    const st = { trigger: dark, start: 'top 95%', end: 'top 15%', scrub: true };
    gsap.fromTo([light, dark].filter(Boolean), { backgroundColor: from }, { backgroundColor: to, ease: 'power1.inOut', scrollTrigger: st });
    $$('[data-blend-text]', dark).forEach((t) => gsap.fromTo(t, { color: t.dataset.blendText!.split(',')[0] }, { color: t.dataset.blendText!.split(',')[1], ease: 'power1.inOut', scrollTrigger: st }));
  });

  if (canHover()) {
    // magnetic buttons
    $$('.mag').forEach((b) => {
      b.addEventListener('mousemove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 }); });
      b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,.4)' }));
    });
    // "view" bubble that follows the cursor over projects
    const v = $('#view-cursor');
    if (v) {
      const xTo = gsap.quickTo(v, 'x', { duration: 0.35 }), yTo = gsap.quickTo(v, 'y', { duration: 0.35 });
      addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); });
      document.addEventListener('mouseover', (e) => {
        const on = !!(e.target as Element).closest('.card,.panel,[data-view]');
        gsap.to(v, { scale: on ? 1 : 0, duration: 0.3, overwrite: 'auto' });
      });
    }
  }
});
