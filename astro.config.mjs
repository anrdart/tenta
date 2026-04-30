// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://tentaklik.com',
  output: 'static',
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      PUBLIC_SITE_URL:  envField.string({ context: 'client', access: 'public', default: 'https://tentaklik.com' }),
      PUBLIC_WA_NUMBER: envField.string({ context: 'client', access: 'public', default: '6281234567890' }),
      PUBLIC_GA_ID:     envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  adapter: cloudflare(),
});