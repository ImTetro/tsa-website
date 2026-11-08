import { describe, expect, test } from 'vitest';
// @ts-ignore – plain .mjs build script
import { applyBase } from '../scripts/apply-base.mjs';

describe('applyBase (GitHub Pages sub-path)', () => {
  const b = '/tsa-website';
  test('prefixes root-relative links and form actions', () => {
    expect(applyBase('<a href="/projects">x</a><a href="/">h</a>', b)).toBe('<a href="/tsa-website/projects">x</a><a href="/tsa-website/">h</a>');
  });
  test('leaves already-based, external, protocol-relative, tel and hash links alone', () => {
    const html = '<img src="/tsa-website/_astro/a.webp"><a href="https://x.com/a"></a><a href="//cdn/x"></a><a href="tel:098"></a><a href="#main"></a>';
    expect(applyBase(html, b)).toBe(html);
  });
  test('prefixes urls inside the hero caption JSON', () => {
    expect(applyBase('data-caps="[{&quot;url&quot;:&quot;/projects/towers&quot;}]"', b)).toBe('data-caps="[{&quot;url&quot;:&quot;/tsa-website/projects/towers&quot;}]"');
  });
  test('no-op when base is / or empty', () => {
    expect(applyBase('<a href="/x">', '/')).toBe('<a href="/x">');
    expect(applyBase('<a href="/x">', '')).toBe('<a href="/x">');
  });
});
