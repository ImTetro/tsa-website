import { Flip } from 'gsap/Flip';
import { gsap, ScrollTrigger, onPage, $, $$, reduced, canHover } from './core';

gsap.registerPlugin(Flip);

/** Projects browser: grid/list toggle, hover preview in list view, client-side filter on /projects (?f=). */
onPage(() => {
  const root = $('[data-browser]');
  if (!root) return;
  const grid = $('#browser-grid', root)!, table = $<HTMLTableElement>('#browser-list', root)!;
  const motion = !reduced();

  // ---- grid / list ----
  const modeBtns = $$<HTMLButtonElement>('[data-view-mode]', root);
  const setMode = (m: string) => {
    modeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewMode === m)));
    grid.hidden = m === 'list'; table.hidden = m !== 'list';
    try { localStorage.setItem('tsa-view', m); } catch { /* ignore */ }
    ScrollTrigger.refresh();
  };
  modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.viewMode!)));
  try { if (localStorage.getItem('tsa-view') === 'list') setMode('list'); } catch { /* ignore */ }

  // ---- list hover preview (desktop) ----
  const pv = $('#plist-preview', root), pimg = pv?.querySelector('img');
  if (pv && pimg && canHover()) {
    const xTo = gsap.quickTo(pv, 'x', { duration: 0.4 }), yTo = gsap.quickTo(pv, 'y', { duration: 0.4 });
    table.addEventListener('mousemove', (e) => { xTo(e.clientX - 150); yTo(e.clientY); });
    $$<HTMLTableRowElement>('tbody tr', table).forEach((tr) => {
      tr.addEventListener('mouseenter', () => { pimg.src = tr.dataset.preview!; pv.classList.add('on'); });
      tr.addEventListener('mouseleave', () => pv.classList.remove('on'));
    });
  }

  // ---- client-side filter (only on /projects; category pages are server-rendered) ----
  if (root.dataset.browser !== 'filter') return;
  const chips = $$<HTMLButtonElement>('.chip[data-f]', root);
  const apply = (f: string, animate: boolean) => {
    if (!chips.some((c) => c.dataset.f === f)) f = 'all';
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.f === f)));
    const cards = $$('.card', grid);
    const state = animate && motion && !grid.hidden ? Flip.getState(cards) : null;
    const show = (el: HTMLElement) => f === 'all' || el.dataset.c === f;
    cards.forEach((c) => { c.style.display = show(c) ? '' : 'none'; });
    $$('tbody tr', table).forEach((r) => { r.style.display = show(r) ? '' : 'none'; });
    if (state) Flip.from(state, { duration: 0.7, ease: 'power3.inOut', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.4 }) });
    ScrollTrigger.refresh();
    return f;
  };
  chips.forEach((b) => b.addEventListener('click', () => {
    const f = apply(b.dataset.f!, true);
    const url = new URL(location.href);
    if (f === 'all') url.searchParams.delete('f'); else url.searchParams.set('f', f);
    history.replaceState(null, '', url);
  }));
  const initial = new URLSearchParams(location.search).get('f');
  if (initial) apply(initial, false);
});
