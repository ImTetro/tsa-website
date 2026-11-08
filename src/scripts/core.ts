import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canHover = () => matchMedia('(hover: hover)').matches;
export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/** Runs fn once the DOM is ready. */
export function onPage(fn: () => void) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

onPage(() => {
  if (!reduced()) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // tell the inline safety net that scripts are alive
  (window as any).__tsaReady = true;
  // images loading late change layout; keep triggers accurate
  window.addEventListener('load', () => ScrollTrigger.refresh());
});

export { gsap, ScrollTrigger };
