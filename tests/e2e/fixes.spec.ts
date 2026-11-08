import { afterAll, describe, expect, test } from 'vitest';
import { close, open, launch, BASE } from './browser';
afterAll(close);

describe('final review fixes', () => {
  test('hero scrim stays above every slide', async () => {
    const { page } = await open('/', { reducedMotion: true });
    const r = await page.evaluate(() => ({ shade: +getComputedStyle(document.getElementById('shade')!).zIndex, slides: document.querySelectorAll('#hero .slide').length }));
    expect(r.shade).toBeGreaterThan(r.slides);
    await page.context().close();
  });

  test('links still navigate when site storage is blocked', async () => {
    const b = await launch();
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => {
      for (const k of ['sessionStorage', 'localStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('denied', 'SecurityError'); } });
    });
    const page = await ctx.newPage();
    await page.goto(BASE + '/team');
    await page.waitForTimeout(500);
    await page.click('#site-header .main-nav a[href="/about"]');
    await page.waitForURL('**/about', { timeout: 5000 });
    expect(new URL(page.url()).pathname).toBe('/about');
    await ctx.close();
  });

  test('project page has an inline inquiry form carrying the project name', async () => {
    const { page } = await open('/projects/commercial/laguna');
    expect(await page.inputValue('#contact-form input[name=project]')).toBe('לגונה');
    expect(await page.textContent('#contact-form')).toContain('לגונה');
    await page.context().close();
  });

  test('urban renewal page has an inline residents form', async () => {
    const { page } = await open('/urban-renewal');
    expect(await page.isVisible('#contact-form #cf-address')).toBe(true);
    expect(await page.isVisible('#contact-form #cf-times')).toBe(true);
    await page.context().close();
  });

  test('home page has an inline contact form', async () => {
    const { page } = await open('/');
    expect(await page.isVisible('#contact-form #cf-name')).toBe(true);
    await page.context().close();
  });

  test('mobile hero caption is not covered by the sticky call bar', async () => {
    const { page } = await open('/', { width: 390, height: 844, reducedMotion: true });
    const cap = await page.locator('#caption').boundingBox();
    const bar = await page.locator('.sticky-contact').boundingBox();
    expect(cap!.y + cap!.height).toBeLessThanOrEqual(bar!.y);
    await page.context().close();
  });
});
