// Middleware SSR (edge Cloudflare): auto-pilih bahasa via IP pada halaman on-demand.
// Aturan: IP Indonesia → ID (root), IP selain Indonesia → EN (/en).
// Pilihan manual disimpan di cookie `pref_lang` dan tidak ditimpa geo.
// Hanya berjalan untuk route on-demand (prerender=false): home + LP whitelist.
import { defineMiddleware } from 'astro:middleware';
import { stripLocale } from '@i18n/utils';

const COOKIE = 'pref_lang';
const ONE_YEAR = 60 * 60 * 24 * 365;

function cookieHeader(value: string): string {
  return `${COOKIE}=${value}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, cookies } = context;

  // Lewati aset / non-navigasi (route on-demand kita hanya halaman HTML).
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) return next();

  const isEnPath = url.pathname === '/en' || url.pathname.startsWith('/en/');
  const currentLang: 'id' | 'en' = isEnPath ? 'en' : 'id';

  const pref = cookies.get(COOKIE)?.value;

  // Sudah ada preferensi → hormati (tanpa auto-redirect), sinkronkan cookie ke URL saat ini.
  if (pref === 'id' || pref === 'en') {
    if (pref !== currentLang) cookies.set(COOKIE, currentLang, { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
    return next();
  }

  // Kunjungan pertama → deteksi negara dari header Cloudflare.
  const country = (request.headers.get('cf-ipcountry') || '').toUpperCase();
  // Default ID bila tak diketahui (dev lokal / bukan Cloudflare / placeholder).
  const wantLang: 'id' | 'en' = !country || country === 'ID' || country === 'XX' || country === 'T1' ? 'id' : 'en';

  if (wantLang !== currentLang) {
    const neutral = stripLocale(url.pathname);
    const target = wantLang === 'en'
      ? `/en${neutral === '/' ? '' : neutral}`
      : neutral;
    return new Response(null, {
      status: 302,
      headers: { Location: target + url.search, 'Set-Cookie': cookieHeader(wantLang) },
    });
  }

  // Bahasa sudah sesuai → set cookie, lanjut.
  cookies.set(COOKIE, wantLang, { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
  return next();
});
