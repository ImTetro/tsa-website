import { gsap, onPage, $, reduced } from './core';

/**
 * Blueprint curtain between pages. On click of an internal link the curtain rises and shows the
 * destination's title; after navigation the new page starts covered (html.curtain-in, set inline
 * in <head> from sessionStorage) and the curtain lifts away.
 */
const KEY = 'tsa-curtain';

onPage(() => {
  const curtain = $('#curtain');
  const title = $('#curtain-title');
  if (!curtain || !title) return;

  if (document.documentElement.classList.contains('curtain-in')) {
    const t = sessionStorage.getItem(KEY) || '';
    sessionStorage.removeItem(KEY);
    title.textContent = t;
    gsap.set(curtain, { scaleY: 1, transformOrigin: 'top' });
    gsap.set(title, { opacity: t ? 1 : 0 });
    document.documentElement.classList.remove('curtain-in');
    gsap.timeline()
      .to(title, { opacity: 0, duration: 0.3, delay: 0.15 })
      .to(curtain, { scaleY: 0, duration: 0.7, ease: 'power3.inOut' }, '-=0.1');
  }

  if (reduced()) return;
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol.startsWith('tel') || (url.pathname === location.pathname && url.hash)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    const label = a.dataset.title || a.querySelector('b')?.textContent || a.textContent?.trim() || '';
    sessionStorage.setItem(KEY, label.slice(0, 60));
    title.textContent = label;
    gsap.timeline({ onComplete: () => { location.href = url.href; } })
      .set(curtain, { transformOrigin: 'bottom', pointerEvents: 'auto' })
      .to(curtain, { scaleY: 1, duration: 0.6, ease: 'power3.inOut' })
      .to(title, { opacity: 1, duration: 0.3 }, '-=0.15');
  });
  // back/forward cache: never come back to a covered page
  addEventListener('pageshow', (ev) => { if ((ev as PageTransitionEvent).persisted) gsap.set(curtain, { scaleY: 0, pointerEvents: 'none' }); });
});
