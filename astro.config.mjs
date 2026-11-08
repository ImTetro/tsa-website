import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// BASE_PATH / SITE_URL are set only for preview hosting on a sub-path (GitHub Pages);
// the real site is served from the root of www.tsa.co.il.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.tsa.co.il',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: { responsiveStyles: false },
});
