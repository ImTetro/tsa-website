import { gsap, onPage, $, $$, reduced, getLenis } from './core';

/**
 * Full-screen gallery in a native <dialog> (focus is contained by the browser, Esc closes).
 * RTL: ← (ArrowLeft) moves to the next image, → to the previous. Swipe works on touch.
 */
onPage(() => {
  const gal = $('[data-gallery]'), dlg = $<HTMLDialogElement>('#lightbox');
  if (!gal || !dlg) return;
  const srcs: string[] = JSON.parse(gal.dataset.gallery || '[]');
  const title = gal.dataset.title || '';
  const img = $<HTMLImageElement>('#lb-img', dlg)!, nEl = $('#lb-n', dlg)!;
  let i = 0, opener: HTMLElement | null = null;

  const show = (n: number, dir = 0) => {
    i = (n + srcs.length) % srcs.length;
    nEl.textContent = String(i + 1);
    img.alt = `${title} – תמונה ${i + 1} מתוך ${srcs.length}`;
    if (dir && !reduced()) {
      gsap.fromTo(img, { opacity: 0, x: dir * -40 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' });
    }
    img.src = srcs[i];
    // warm the next image
    const pre = new Image(); pre.src = srcs[(i + 1) % srcs.length];
  };
  const open = (n: number, from: HTMLElement) => {
    opener = from; show(n);
    dlg.showModal(); getLenis()?.stop();
    $<HTMLButtonElement>('#lb-close', dlg)!.focus();
  };
  const next = () => show(i + 1, 1), prev = () => show(i - 1, -1);

  $$<HTMLButtonElement>('.g-item', gal).forEach((b) => b.addEventListener('click', () => open(+b.dataset.index!, b)));
  $('#lb-close', dlg)!.addEventListener('click', () => dlg.close());
  $('#lb-next', dlg)?.addEventListener('click', next);
  $('#lb-prev', dlg)?.addEventListener('click', prev);
  dlg.addEventListener('close', () => { getLenis()?.start(); opener?.focus(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); prev(); }
    else if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = $$<HTMLElement>('button', dlg);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // click on the dark area (not the image or buttons) closes
  $('#lb-stage', dlg)!.addEventListener('click', (e) => { if (e.target === e.currentTarget) dlg.close(); });

  // swipe: in RTL a swipe to the right shows the next image
  let x0: number | null = null;
  const stage = $('#lb-stage', dlg)!;
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null || srcs.length < 2) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) (dx > 0 ? next : prev)();
  });
});
