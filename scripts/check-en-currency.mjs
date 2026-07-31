import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const fileUrl = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFileSync(fileUrl(path), 'utf8');
const data = read('src/data/sewa-akun.ts');
const homePricing = read('src/components/sections/HomePricing.astro');
const enRentalPage = read('src/pages/en/layanan/sewa-akun.astro');
const enContact = read('src/pages/en/kontak.astro');
const idContact = read('src/pages/kontak.astro');
const middleware = read('src/middleware.ts').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

const exportBlock = (source, name) => {
  const start = source.search(new RegExp(`^export const ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing ${name}`);
  const rest = source.slice(start + 1);
  const next = rest.search(/^export const \w+\b/m);
  return source.slice(start, next === -1 ? undefined : start + 1 + next);
};

const plansEn = exportBlock(data, 'SEWA_PLANS_EN');
const rentalEn = exportBlock(data, 'SEWA_RENTAL_EN');
const rentalId = exportBlock(data, 'SEWA_RENTAL');

for (const [feature, pattern] of [
  ['$20 - $300 per top-up', /['"]\$20 - \$300 per top-up['"]/],
  ['$300 - $900 per top-up', /['"]\$300 - \$900 per top-up['"]/],
  ['Above $900 per top-up', /['"]Above \$900 per top-up['"]/],
]) {
  assert.match(plansEn, pattern, `Missing feature: '${feature}' in SEWA_PLANS_EN`);
}
for (const [price, pattern] of [
  ['$10', /price:\s*['"]\$10['"]/],
  ['$25', /price:\s*['"]\$25['"]/],
  ['$50', /price:\s*['"]\$50['"]/],
]) {
  assert.match(rentalEn, pattern, `Missing price: '${price}' in SEWA_RENTAL_EN`);
}

assert.match(homePricing, /lang\s*===\s*['"]en['"]\s*\?\s*SEWA_PLANS_EN\s*:\s*SEWA_PLANS/, 'Missing English plans locale selection');
assert.match(homePricing, /lang\s*===\s*['"]en['"]\s*\?\s*SEWA_RENTAL_EN\s*:\s*SEWA_RENTAL/, 'Missing English rental locale selection');
assert.match(homePricing, /plans\.map\s*\(/, 'HomePricing does not render selected plans');
assert.match(homePricing, /rental\.setup\b/, 'HomePricing does not render selected rental setup');
assert.match(homePricing, /rental\.tiers\.map\s*\(/, 'HomePricing does not render selected rental tiers');
assert.match(enRentalPage, /plans\s*=\s*\{\s*SEWA_PLANS_EN\s*\}/, 'English account-rental page does not use SEWA_PLANS_EN');

assert.doesNotMatch(enContact, /\b(?:Rp|rb|jt)\b|\d+(?:[.,]\d+)?\s*(?:rb|jt)\b/i, 'English contact contains IDR markers');
for (const value of ['$300', '$600', '$1,500', '$3,000']) {
  assert.ok(enContact.includes(value), `Missing ${value} in English contact`);
}
for (const range of ['< Rp 5jt', 'Rp 5-10jt', 'Rp 10-25jt', 'Rp 25-50jt', '> Rp 50jt']) {
  assert.ok(idContact.includes(`value="${range}"`), `Missing exact ${range} value in Indonesian contact`);
}
for (const [price, pattern] of [
  ['150rb', /price:\s*['"]150rb['"]/],
  ['350rb', /price:\s*['"]350rb['"]/],
  ['792rb', /price:\s*['"]792rb['"]/],
]) {
  assert.match(rentalId, pattern, `Missing price: '${price}' in SEWA_RENTAL`);
}

const routeGuardStart = middleware.search(/stripLocale\s*\(\s*url\.pathname\s*\)/);
const geoLogicStart = middleware.indexOf('const isEnPath');
assert.notEqual(routeGuardStart, -1, 'Middleware must derive a locale-neutral path');
assert.ok(geoLogicStart > routeGuardStart, 'Middleware route guard must run before geo logic');
const routeGuard = middleware.slice(routeGuardStart, geoLogicStart);
assert.match(routeGuard, /['"]\/whitelist\/metaads\/?['"]/, 'Middleware must allow only the Meta Ads whitelist LP');
assert.match(routeGuard, /['"]\/whitelist\/gads\/?['"]/, 'Middleware must allow only the Google Ads whitelist LP');
assert.match(routeGuard, /if\b[\s\S]*return\s+next\s*\(\s*\)/, 'Middleware must bypass paths outside the whitelist LP allowlist');
assert.ok(
  /!\s*[^;\n]*(?:includes|has|some)\s*\(/.test(routeGuard)
    || /(?:!==|!=)[\s\S]*&&[\s\S]*(?:!==|!=)/.test(routeGuard),
  'Middleware route guard must reject paths outside the exact allowlist',
);

const builtPages = [
  ['dist/client/en/index.html', /\$10\b/, 'English homepage'],
  ['dist/client/en/kontak/index.html', /\$300\b/, 'English contact'],
  ['dist/client/en/layanan/sewa-akun/index.html', /(?:\$|&#(?:36|x24);)20\s*(?:-|&(?:#45|#x2d|minus|ndash);|&#(?:8211|x2013);)\s*(?:\$|&#(?:36|x24);)300/i, 'English account-rental'],
];
const builtFilesExist = builtPages.map(([path]) => existsSync(fileUrl(path)));

if (builtFilesExist.some(Boolean)) {
  assert.ok(builtFilesExist.every(Boolean), 'Expected all three built English pages when any built output exists');
  for (const [path, expectedUsd, label] of builtPages) {
    const html = read(path);
    assert.doesNotMatch(html, /<meta\b[^>]*http-equiv\s*=\s*["']?refresh\b/i, `${label} build is a meta-refresh redirect document`);
    assert.doesNotMatch(html, /(?:window\.|document\.)?location(?:\.href|\.replace)?\s*(?:=|\()/i, `${label} build directly redirects with location`);
    assert.match(html, expectedUsd, `${label} build is missing expected USD pricing`);
  }
  console.log('Built English pages are real HTML with expected USD pricing');
} else {
  console.log('Built English pages not found; skipped build-output checks');
}

console.log('English USD pricing checks passed');
