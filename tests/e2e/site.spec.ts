import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { BASE, close, open } from './browser';

let pages: string[] = [];
const NAV = ['/projects', '/urban-renewal', '/about', '/team', '/clients', '/contact'];

/** Crawl from / and collect every same-origin page path (statuses recorded). */
async function crawl() {
  const seen = new Map<string, number>([['/', 0]]), queue = ['/'];
  while (queue.length) {
    const path = queue.shift()!;
    const res = await fetch(BASE + encodeURI(path));
    seen.set(path, res.status);
    if (res.status !== 200 || !(res.headers.get('content-type') || '').includes('text/html')) continue;
    for (const [, href] of (await res.text()).matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
      const u = new URL(href.replace(/&amp;/g, '&'), BASE + path);
      if (u.origin !== new URL(BASE).origin) continue;
      const p = decodeURI(u.pathname).replace(/(.)\/$/, '$1');
      if (!seen.has(p)) { seen.set(p, 0); queue.push(p); }
    }
  }
  return seen;
}

let statuses: Map<string, number>;
beforeAll(async () => { statuses = await crawl(); pages = [...statuses.keys()].filter((p) => statuses.get(p) === 200); }, 120000);
afterAll(close);

describe('whole site', () => {
  test('every internal link returns 200', () => {
    const bad = [...statuses].filter(([, s]) => s !== 200);
    expect(bad).toEqual([]);
    expect(pages.length).toBeGreaterThan(30);
    for (const p of NAV) expect(pages).toContain(p);
  });

  test('every NAV page is reachable from the header on every page; no # hrefs', async () => {
    for (const p of pages) {
      const { page } = await open(p, { js: false });
      const hrefs = await page.$$eval('#site-header .main-nav a', (as) => as.map((a) => a.getAttribute('href') || ''));
      expect(hrefs.filter((h) => h.startsWith('#')), p).toEqual([]);
      for (const n of NAV) expect(hrefs, `${p} header`).toContain(n);
      await page.context().close();
    }
  }, 300000);

  test.each(['/', '/team'])('header stays visible after scrolling 3000px on %s', async (p) => {
    const { page } = await open(p);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    const box = await page.locator('#site-header').boundingBox();
    expect(box?.y).toBe(0);
    expect(await page.isVisible('#site-header .logo')).toBe(true);
    await page.context().close();
  });

  test.each([[1440, 900], [390, 844]])('no page has console errors at %ix%i', async (w, h) => {
    const errs: string[] = [];
    for (const p of pages) {
      const { page, errors } = await open(p, { width: w, height: h });
      await page.waitForTimeout(400);
      errs.push(...errors.map((e) => `${p}: ${e}`));
      await page.context().close();
    }
    expect(errs).toEqual([]);
  }, 600000);

  test('with JS disabled every page shows its h1 and all cards are opaque', async () => {
    for (const p of pages) {
      const { page } = await open(p, { js: false });
      expect(await page.isVisible('h1'), `${p} h1`).toBe(true);
      const ops = await page.$$eval('.card, .split .w>span, [data-reveal]', (els) => els.map((e) => getComputedStyle(e).opacity + '|' + getComputedStyle(e).transform));
      expect(ops.filter((o) => !o.startsWith('1|')), p).toEqual([]);
      await page.context().close();
    }
  }, 300000);

  test('reduced motion: home hero shows its final state immediately', async () => {
    const { page } = await open('/', { reducedMotion: true });
    await page.waitForTimeout(500);
    const st = await page.$eval('#h1 .w>span', (e) => ({ t: getComputedStyle(e).transform, o: getComputedStyle(e.closest('.copy')!).opacity }));
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(st.t);
    expect(st.o).toBe('1');
    expect(await page.$eval('#shade', (e) => getComputedStyle(e).opacity)).toBe('1');
    await page.context().close();
  });

  test('no horizontal overflow at 390px', async () => {
    const over: string[] = [];
    for (const p of pages) {
      const { page } = await open(p, { width: 390, height: 844 });
      const d = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (d > 0) over.push(`${p}: +${d}px`);
      await page.context().close();
    }
    expect(over).toEqual([]);
  }, 300000);

  test('every <img> has an alt attribute', async () => {
    const missing: string[] = [];
    for (const p of pages) {
      const res = await fetch(BASE + encodeURI(p));
      for (const [tag] of (await res.text()).matchAll(/<img\b[^>]*>/g)) if (!/\salt(?=[\s=>/])/.test(tag)) missing.push(`${p}: ${tag.slice(0, 80)}`);
    }
    expect(missing).toEqual([]);
  });
});
