// Builds the site for the GitHub Pages sub-path and publishes dist/ to the gh-pages branch.
// Usage: npm run deploy   (needs a GitHub remote named origin)
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sh = (c, o = {}) => execSync(c, { stdio: 'inherit', ...o });
const remote = execSync('git remote get-url origin').toString().trim();
const [, owner, repo] = remote.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/) || [];
if (!owner) throw new Error(`origin is not a GitHub repo: ${remote}`);

sh('npm run build', { env: { ...process.env, BASE_PATH: `/${repo}`, SITE_URL: `https://${owner.toLowerCase()}.github.io`, MSYS_NO_PATHCONV: '1' } });

const dir = mkdtempSync(join(tmpdir(), 'ghp-'));
cpSync('dist', dir, { recursive: true });
writeFileSync(join(dir, '.nojekyll'), '');
sh('git init -q -b gh-pages && git add -A && git commit -qm "deploy" && git push -f ' + remote + ' gh-pages', { cwd: dir });
rmSync(dir, { recursive: true, force: true });
console.log(`\nPublished: https://${owner.toLowerCase()}.github.io/${repo}/`);
