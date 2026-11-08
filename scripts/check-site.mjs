// Crawl a running site (default: astro preview on :4321) from / and report every internal link that is not 200.
// usage: node scripts/check-site.mjs [baseUrl]
const base = process.argv[2] || 'http://localhost:4321';
const seen = new Set(['/']), queue = ['/'], bad = [];
while (queue.length) {
  const path = queue.shift();
  const res = await fetch(base + path);
  if (res.status !== 200) { bad.push(`${res.status} ${path}`); continue; }
  if (!(res.headers.get('content-type') || '').includes('text/html')) continue;
  const html = await res.text();
  for (const [, href] of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const u = new URL(href.replace(/&amp;/g, '&'), base + path);
    if (u.origin !== new URL(base).origin) continue;
    const p = decodeURI(u.pathname);
    if (!seen.has(p)) { seen.add(p); queue.push(encodeURI(p)); }
  }
}
console.log(`checked ${seen.size} pages; ${bad.length ? 'broken:\n' + bad.join('\n') : 'all 200'}`);
process.exit(bad.length ? 1 : 0);
