import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://schoolpulse.victorbee.com',
  output: 'static',
  integrations: [sitemap()],
});
