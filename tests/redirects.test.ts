import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { OLD_URLS } from '../src/site';

const lines = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8').split(/\r?\n/).map((l) => l.trim().split(/\s+/));
const has = (from: string, to: string) => lines.some(([f, t, c]) => f === from && t === to && c === '301');

describe('_redirects', () => {
  test('/home goes to /', () => expect(has('/home', '/')).toBe(true));
  test.each(OLD_URLS)('%s → %s (raw and encoded)', (from, to) => {
    expect(has(from, to)).toBe(true);
    expect(has(encodeURI(from), to)).toBe(true);
  });
  test('Hebrew category pages are covered', () => {
    for (const p of ['/מגדלים', '/מסחר', '/משרדים', '/וילות', '/copy-of-משרדים', '/copy-of-התחדשות-עירונית', '/meet-the-team']) {
      expect(OLD_URLS.some(([f]) => f === p)).toBe(true);
    }
  });
});
