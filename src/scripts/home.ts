import { Flip } from 'gsap/Flip';
import { gsap, ScrollTrigger, onPage, $, $$, reduced } from './core';

gsap.registerPlugin(Flip);

/** Home-only interactions: featured grid filter and the pinned category track. */
onPage(() => {
  const motion = !reduced();

  // ---- featured grid: chip filter (works with or without motion) ----
  const grid = $('#featured-grid');
  const chips = $$<HTMLButtonElement>('.projects .chip');
  chips.forEach((b) => b.addEventListener('click', () => {
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f, cards = $$('.card', grid!);
    const state = motion ? Flip.getState(cards) : null;
    cards.forEach((c) => { c.style.display = f === 'all' || c.dataset.c === f ? '' : 'none'; });
    if (state) Flip.from(state, { duration: 0.7, ease: 'power3.inOut', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4 }) });
    ScrollTrigger.refresh();
  }));

  // ---- categories: pin + horizontal scroll on desktop; native swipe on mobile ----
  const track = $('#track');
  if (track && motion) {
    gsap.fromTo(track, { opacity: 0, y: 80 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '.cats', start: 'top 80%', end: 'top 10%', scrub: true } });
    gsap.matchMedia().add('(min-width: 821px)', () => {
      // RTL: panels run right→left, so the track moves to the right (+x)
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, { x: () => dist(), ease: 'none', scrollTrigger: { trigger: '.cats', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
    });
  }

});
