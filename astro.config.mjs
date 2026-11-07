import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.tsa.co.il',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: { responsiveStyles: false },
});
