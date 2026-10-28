import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://zajuak.github.io',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  redirects: { '/about': '/links/' },
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
  devToolbar: { enabled: false },
});
