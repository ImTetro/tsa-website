import { onPage, $, $$, getLenis } from './core';

/** Header is always visible. Over a dark hero it is transparent until the hero is mostly scrolled past. */
onPage(() => {
  const header = $('#site-header');
  if (!header) return;
  const hero = $('[data-hero]');
  const update = () => {
    const limit = hero ? hero.offsetHeight * 0.75 : -1;
    header.classList.toggle('solid', window.scrollY > limit);
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);

  // mobile menu
  const burger = $('#burger');
  const menu = $('#mobile-menu');
  const setOpen = (open: boolean) => {
    document.body.classList.toggle('menu-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    menu?.toggleAttribute('inert', !open);
    const l = getLenis();
    if (l) open ? l.stop() : l.start();
    $$('#mobile-menu > nav > ul > li').forEach((li, i) => (li.style.transitionDelay = open ? `${0.15 + i * 0.05}s` : '0s'));
  };
  burger?.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
  addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
});
