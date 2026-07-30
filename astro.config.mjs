// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://tentaklik.com',
  output: 'static',
  trailingSlash: 'never',

  // Permalink LP diubah ke /whitelist/*. Redirect 301 dari URL lama (SEO + iklan existing).
  redirects: {
    '/meta-whitelist': '/whitelist/metaads',
    '/google-whitelist': '/whitelist/gads',
    '/en/meta-whitelist': '/en/whitelist/metaads',
    '/en/google-whitelist': '/en/whitelist/gads',
  },

  // i18n: ID default di root (/), EN di /en/. Halaman EN yang belum ada
  // jatuh ke konten ID via fallback rewrite (URL tetap /en/...).
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false, fallbackType: 'rewrite' },
    fallback: { en: 'id' },
  },

  build: {
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  integrations: [
    sitemap({
      changefreq: EnumChangefreq.WEEKLY,
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'id',
        locales: { id: 'id-ID', en: 'en-US' },
      },
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const url = item.url;
        if (url === 'https://tentaklik.com/' || url === 'https://tentaklik.com') {
          item.priority = 1.0;
          item.changefreq = EnumChangefreq.DAILY;
        } else if (url.includes('/layanan/')) {
          item.priority = 0.9;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (url.includes('/partner')) {
          item.priority = 0.8;
          item.changefreq = EnumChangefreq.MONTHLY;
        } else if (url.endsWith('/kontak') || url.endsWith('/kontak/')) {
          item.priority = 0.8;
          item.changefreq = EnumChangefreq.MONTHLY;
        } else if (url.endsWith('/tentang') || url.endsWith('/tentang/')) {
          item.priority = 0.7;
          item.changefreq = EnumChangefreq.MONTHLY;
        } else if (url.endsWith('/karir') || url.endsWith('/karir/')) {
          item.priority = 0.6;
          item.changefreq = EnumChangefreq.WEEKLY;
        }
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      PUBLIC_SITE_URL:  envField.string({ context: 'client', access: 'public', default: 'https://tentaklik.com' }),
      PUBLIC_WA_NUMBER: envField.string({ context: 'client', access: 'public', default: '6285129992225' }),
      PUBLIC_GA_ID:     envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  adapter: cloudflare({
    imageService: 'compile',
  }),
});