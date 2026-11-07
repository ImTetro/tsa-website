import { gsap, onPage, $, $$, reduced } from './core';

/** Client logo rows drift in opposite directions; slow down on hover. */
onPage(() => {
  const motion = !reduced();
  // ---- client marquee: rows hold the logos twice, so moving 50% loops seamlessly ----
  if (motion) $$('.marquee').forEach((m) => {
    const row = $('.row', m)!, dir = +(m.dataset.dir || 1);
    const t = gsap.fromTo(row, { xPercent: dir > 0 ? 0 : 50 }, { xPercent: dir > 0 ? 50 : 0, duration: 45, ease: 'none', repeat: -1 });
    m.addEventListener('mouseenter', () => gsap.to(t, { timeScale: 0.15, duration: 0.4 }));
    m.addEventListener('mouseleave', () => gsap.to(t, { timeScale: 1, duration: 0.4 }));
  });
});
