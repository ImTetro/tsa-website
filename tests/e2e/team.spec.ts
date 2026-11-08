import { afterAll, describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { close, open } from './browser';
afterAll(close);

const team = JSON.parse(readFileSync(new URL('../../src/data/team.json', import.meta.url), 'utf8'));
const people = [...team.partners, ...team.staff] as { name: string; role: string; photo: string }[];
test("team data: every member has a photo", () => { for (const p of people) expect(p.photo, p.name).toBeTruthy(); });

describe.each([[1440, 900], [390, 844]])('team page at %ix%i', (w, h) => {
  test('every team member shows name, role and photo (loaded, visible)', async () => {
    const { page } = await open('/team', { width: w, height: h });
    // scroll through so lazy images load
    for (let y = 0; y < 12000; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(120); }
    await page.waitForTimeout(800);
    const cards = await page.$$eval('.partner, .person', (els) => els.map((el) => {
      const img = el.querySelector('img') as HTMLImageElement | null;
      const r = img?.getBoundingClientRect();
      return {
        name: (el.querySelector('h2, b')?.textContent || '').trim(),
        role: (el.querySelector('.kicker-dark, span:not(.initials)')?.textContent || '').trim(),
        img: img ? { loaded: img.complete && img.naturalWidth > 0, w: r!.width, h: r!.height, alt: img.alt } : null,
      };
    }));
    expect(cards.map((c) => c.name)).toEqual(people.map((p) => p.name));
    for (const [i, p] of people.entries()) {
      const c = cards[i];
      expect(c.role, p.name).toBe(p.role);
      {
        expect(c.img, `${p.name} photo`).not.toBeNull();
        expect(c.img!.loaded, `${p.name} photo loaded`).toBe(true);
        expect(c.img!.w * c.img!.h, `${p.name} photo size`).toBeGreaterThan(5000);
        expect(c.img!.alt).toBe(p.name);
      }
    }
    await page.context().close();
  });
});
