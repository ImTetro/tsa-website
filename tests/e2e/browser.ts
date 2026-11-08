import { chromium, type Browser, type Page } from 'playwright-core';

export const BASE = process.env.E2E_URL || 'http://localhost:4322';
let browser: Browser | null = null;

/** Installed Edge (or Chrome via E2E_CHANNEL) driven by playwright-core. */
export async function launch(): Promise<Browser> {
  browser ??= await chromium.launch({ channel: process.env.E2E_CHANNEL || 'msedge', headless: true });
  return browser;
}
export async function close() { await browser?.close(); browser = null; }

export async function open(path: string, opts: { width?: number; height?: number; js?: boolean; reducedMotion?: boolean } = {}): Promise<{ page: Page; errors: string[] }> {
  const b = await launch();
  const ctx = await b.newContext({ viewport: { width: opts.width ?? 1440, height: opts.height ?? 900 }, javaScriptEnabled: opts.js ?? true, reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE + path, { waitUntil: 'load' });
  return { page, errors };
}
