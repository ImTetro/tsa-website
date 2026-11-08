import { gsap, ScrollTrigger, onPage, $, $$, reduced } from './core';

/** Drag (or arrow keys) to compare a sketch with its render; sweeps once when scrolled into view. */
onPage(() => {
  const motion = !reduced();
  // ---- sketch ↔ render compare ----
  const cmp = $('#compare'), sk = $('#sk'), hd = $('#handle');
  if (cmp && sk && hd) {
    const pos = { p: 0.5 };
    const setP = () => { sk.style.clipPath = `inset(0 ${100 - pos.p * 100}% 0 0)`; hd.style.left = pos.p * 100 + '%'; };
    setP();
    if (motion) {
      pos.p = 0.92; setP();
      ScrollTrigger.create({ trigger: cmp, start: 'top 70%', once: true, onEnter: () => gsap.to(pos, { p: 0.08, duration: 1.8, ease: 'power2.inOut', onUpdate: setP,
        onComplete: () => { gsap.to(pos, { p: 0.5, duration: 1.1, ease: 'power2.inOut', onUpdate: setP }); } }) });
    }
    let drag = false;
    const move = (e: PointerEvent) => { const r = cmp.getBoundingClientRect(); pos.p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); gsap.killTweensOf(pos); setP(); };
    cmp.addEventListener('pointerdown', (e) => { drag = true; cmp.setPointerCapture(e.pointerId); move(e); });
    cmp.addEventListener('pointermove', (e) => { if (drag) move(e); });
    cmp.addEventListener('pointerup', () => { drag = false; });
    cmp.tabIndex = 0;
    cmp.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowLeft' ? -0.05 : e.key === 'ArrowRight' ? 0.05 : 0;
      if (d) { e.preventDefault(); gsap.killTweensOf(pos); pos.p = Math.min(1, Math.max(0, pos.p + d)); setP(); }
    });
  }

});
