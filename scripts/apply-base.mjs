// When the site is served from a sub-path (GitHub Pages project site), Astro prefixes its own
// assets with `base`, but hand-written links like href="/projects" stay root-relative.
// This post-build step prefixes them in every HTML file. No-op unless BASE_PATH is set.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function applyBase(html, base) {
  const b = (base || '').replace(/\/+$/, '');
  if (!b) return html;
  const fix = (p) => (p === b || p.startsWith(b + '/') ? p : b + p);
  return html
    // attributes: "/x" but not "//x"
    .replace(/(\s(?:href|src|action|data-src)=")(\/(?!\/)[^"]*)"/g, (_, a, p) => `${a}${fix(p)}"`)
    // JSON in attributes (hero captions): &quot;url&quot;:&quot;/x
    .replace(/(&quot;url&quot;:&quot;)(\/(?!\/)[^&]*)/g, (_, a, p) => a + fix(p));
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p, out) : p.endsWith('.html') && out.push(p); }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const base = process.env.BASE_PATH;
  if (base && base !== '/') {
    const files = walk('dist');
    for (const f of files) writeFileSync(f, applyBase(readFileSync(f, 'utf8'), base));
    console.log(`apply-base: ${base} applied to ${files.length} pages`);
  }
}
