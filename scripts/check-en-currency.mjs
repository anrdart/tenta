import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const fileUrl = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFileSync(fileUrl(path), 'utf8');
const data = read('src/data/sewa-akun.ts');
const homePricing = read('src/components/sections/HomePricing.astro');
const whitelistLpPage = read('src/components/sections/lp/WhitelistLpPage.astro');
const enRentalPage = read('src/pages/en/layanan/sewa-akun.astro');
const enContact = read('src/pages/en/kontak.astro');
const idContact = read('src/pages/kontak.astro');
const metaPricing = read('src/pages/meta-whitelist-pricing.astro');
const googlePricing = read('src/pages/google-whitelist-pricing.astro');
const metaUsd = read('src/pages/meta-whitelist-usd.astro');
const googleUsd = read('src/pages/google-whitelist-usd.astro');
const middleware = read('src/middleware.ts').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

const exportBlock = (source, name) => {
  const start = source.search(new RegExp(`^export const ${name}\\b`, 'm'));
  assert.notEqual(start, -1, `Missing ${name}`);
  const rest = source.slice(start + 1);
  const next = rest.search(/^export const \w+\b/m);
  return source.slice(start, next === -1 ? undefined : start + 1 + next);
};

const namedPlanBlock = (source, exportName, planName) => {
  const plans = [...source.matchAll(/\bname:\s*(['"])([^'"]+)\1/g)];
  const index = plans.findIndex((match) => match[2] === planName);
  assert.notEqual(index, -1, `Missing named plan '${planName}' in ${exportName}`);
  return source.slice(plans[index].index, plans[index + 1]?.index);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exactField = (field, value) => new RegExp(`\\b${field}:\\s*(['"])${escapeRegExp(value)}\\1`);
const exactString = (value) => new RegExp(`(['"])${escapeRegExp(value)}\\1`);

const plansId = exportBlock(data, 'SEWA_PLANS');
const plansEn = exportBlock(data, 'SEWA_PLANS_EN');
const rentalEn = exportBlock(data, 'SEWA_RENTAL_EN');
const rentalId = exportBlock(data, 'SEWA_RENTAL');
const enPlans = Object.fromEntries(['Starter', 'Growth', 'Scale'].map((name) => [name, namedPlanBlock(plansEn, 'SEWA_PLANS_EN', name)]));
const idPlans = Object.fromEntries(['Starter', 'Growth', 'Scale'].map((name) => [name, namedPlanBlock(plansId, 'SEWA_PLANS', name)]));

for (const [name, fee] of [['Starter', '5%'], ['Growth', '4%'], ['Scale', '3%']]) {
  assert.match(enPlans[name], exactField('price', fee), `Missing approved fee '${fee}' for ${name} in SEWA_PLANS_EN`);
}

const approvedFeatures = {
  Starter: ['Monthly spend: $0 - $10,000', 'Standard Priority Support'],
  Growth: ['Monthly spend: $11,000 - $50,000', 'Priority Support'],
  Scale: ['Monthly spend: $51,000 - $100,000', 'VIP Support'],
};
const commonApprovedFeatures = [
  'Official Whitelist Ad Account',
  'No VAT / Tax Markup',
  'Partner Support Appeal',
  'Automatic Balance Migration (Terms & Conditions apply)',
];
for (const [name, uniqueFeatures] of Object.entries(approvedFeatures)) {
  for (const feature of [...uniqueFeatures, ...commonApprovedFeatures]) {
    assert.match(enPlans[name], exactString(feature), `Missing approved feature '${feature}' for ${name} in SEWA_PLANS_EN`);
  }
}

assert.doesNotMatch(plansEn, exactField('price', '4.5%'), "Obsolete fee '4.5%' remains in SEWA_PLANS_EN");
assert.doesNotMatch(plansEn, exactField('price', '3.5%'), "Obsolete fee '3.5%' remains in SEWA_PLANS_EN");
for (const value of ['$20 - $300 per top-up', '$300 - $900 per top-up', 'Above $900 per top-up']) {
  assert.doesNotMatch(plansEn, exactString(value), `Obsolete feature '${value}' remains in SEWA_PLANS_EN`);
}

for (const price of ['$31', '$75', '$169']) {
  assert.match(rentalEn, exactField('price', price), `Missing approved rental price '${price}' in SEWA_RENTAL_EN`);
}
for (const price of ['$10', '$25', '$50']) {
  assert.doesNotMatch(rentalEn, exactField('price', price), `Obsolete rental price '${price}' remains in SEWA_RENTAL_EN`);
}

for (const [name, fee, range] of [
  ['Starter', '5%', 'Sekali topup 300rb - 5jt'],
  ['Growth', '4,5%', 'Sekali topup 5jt - 15jt'],
  ['Scale', '3,5%', 'Topup di atas 15jt'],
]) {
  assert.match(idPlans[name], exactField('price', fee), `Missing Indonesian fee '${fee}' for ${name} in SEWA_PLANS`);
  assert.match(idPlans[name], exactString(range), `Missing Indonesian range '${range}' for ${name} in SEWA_PLANS`);
}

assert.match(homePricing, /lang\s*===\s*['"]en['"]\s*\?\s*SEWA_PLANS_EN\s*:\s*SEWA_PLANS/, 'Missing English plans locale selection');
assert.match(homePricing, /lang\s*===\s*['"]en['"]\s*\?\s*SEWA_RENTAL_EN\s*:\s*SEWA_RENTAL/, 'Missing English rental locale selection');
assert.match(homePricing, /plans\.map\s*\(/, 'HomePricing does not render selected plans');
assert.match(homePricing, /rental\.setup\b/, 'HomePricing does not render selected rental setup');
assert.match(homePricing, /rental\.tiers\.map\s*\(/, 'HomePricing does not render selected rental tiers');
assert.match(enRentalPage, /plans\s*=\s*\{\s*SEWA_PLANS_EN\s*\}/, 'English account-rental page does not use SEWA_PLANS_EN');

for (const [path, source] of [
  ['src/pages/meta-whitelist-pricing.astro', metaPricing],
  ['src/pages/google-whitelist-pricing.astro', googlePricing],
  ['src/pages/meta-whitelist-usd.astro', metaUsd],
  ['src/pages/google-whitelist-usd.astro', googleUsd],
]) {
  const withoutImportsOrComments = source
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    .replace(/^\s*import\b[^;]*;\s*$/gm, '');
  assert.match(withoutImportsOrComments, /\bSEWA_PLANS_EN\b/, `${path} does not consume SEWA_PLANS_EN`);
  assert.doesNotMatch(source, /\bconst\s+englishPlans\s*=/, `${path} still declares englishPlans`);
  assert.doesNotMatch(source, /\bconst\s+usdPlans\s*=/, `${path} still declares usdPlans`);
}

assert.match(
  whitelistLpPage,
  /startingPrice\s*=\s*\{\s*lang\s*===\s*['"]en['"]\s*\?\s*['"]\$31['"]\s*:\s*['"]Rp150\.000['"]\s*\}/,
  'WhitelistLpPage must select English $31 or Indonesian Rp150.000 startingPrice',
);
for (const [path, source] of [
  ['src/pages/meta-whitelist-usd.astro', metaUsd],
  ['src/pages/google-whitelist-usd.astro', googleUsd],
]) {
  assert.match(source, /<LpPromoBanner\s+lang\s*=\s*['"]en['"]\s+startingPrice\s*=\s*['"]\$31['"]\s*\/?\s*>/, `${path} must render LpPromoBanner lang="en" startingPrice="$31"`);
  assert.doesNotMatch(source, /\b(?:originalPrice|promoPrice)\s*=/, `${path} must not pass originalPrice or promoPrice`);
}

assert.doesNotMatch(enContact, /\b(?:Rp|rb|jt)\b|\d+(?:[.,]\d+)?\s*(?:rb|jt)\b/i, 'English contact contains IDR markers');
for (const value of ['$300', '$600', '$1,500', '$3,000']) {
  assert.ok(enContact.includes(value), `Missing ${value} in English contact`);
}
for (const range of ['< Rp 5jt', 'Rp 5-10jt', 'Rp 10-25jt', 'Rp 25-50jt', '> Rp 50jt']) {
  assert.ok(idContact.includes(`value="${range}"`), `Missing exact ${range} value in Indonesian contact`);
}
for (const price of ['150rb', '350rb', '792rb']) {
  assert.match(rentalId, exactField('price', price), `Missing price: '${price}' in SEWA_RENTAL`);
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

const htmlDollar = String.raw`(?:\$|&dollar;|&#0*36;|&#x0*24;)`;
const htmlSpace = String.raw`(?:\s|&nbsp;|&#0*160;|&#x0*a0;)*`;
const htmlComma = String.raw`(?:,|&comma;|&#0*44;|&#x0*2c;|\s*)`;
const htmlDash = String.raw`(?:-|[‐-―−]|&(?:hyphen|minus|ndash|mdash);|&#0*(?:45|8208|8209|8210|8211|8212|8213|8722);|&#x0*(?:2d|2010|2011|2012|2013|2014|2015|2212);)`;
const htmlNumber = (value) => value.split(',').map(escapeRegExp).join(htmlComma);
const htmlUsd = (value) => `${htmlDollar}${htmlSpace}${htmlNumber(value)}(?![\\d,.]|&(?:comma|#0*44|#x0*2c);)`;
const usdHtmlPattern = (value) => new RegExp(htmlUsd(value), 'i');
const monthlySpendHtml = new RegExp(`Monthly${htmlSpace}spend${htmlSpace}:${htmlSpace}${htmlUsd('0')}${htmlSpace}${htmlDash}${htmlSpace}${htmlUsd('10,000')}`, 'i');

const builtPages = [
  ['dist/client/en/index.html', usdHtmlPattern('31'), 'English homepage'],
  ['dist/client/en/kontak/index.html', usdHtmlPattern('300'), 'English contact'],
  ['dist/client/en/layanan/sewa-akun/index.html', monthlySpendHtml, 'English account-rental'],
  ['dist/client/meta-whitelist-usd/index.html', usdHtmlPattern('31'), 'Meta Whitelist USD'],
  ['dist/client/google-whitelist-usd/index.html', usdHtmlPattern('31'), 'Google Whitelist USD'],
];
const requireBuild = process.argv.includes('--require-build');
const missingBuiltPages = builtPages.filter(([path]) => !existsSync(fileUrl(path))).map(([path]) => path);

if (missingBuiltPages.length && (requireBuild || missingBuiltPages.length < builtPages.length)) {
  assert.fail(`Missing built English page(s): ${missingBuiltPages.join(', ')}`);
} else if (missingBuiltPages.length === builtPages.length) {
  console.log('Built English pages not found; skipped build-output checks');
} else {
  for (const [path, expectedUsd, label] of builtPages) {
    const html = read(path);
    assert.doesNotMatch(html, /<meta\b[^>]*http-equiv\s*=\s*["']?refresh\b/i, `${label} build is a meta-refresh redirect document`);
    assert.doesNotMatch(html, /(?:window\.|document\.)?location(?:\.href|\.replace)?\s*(?:=|\()/i, `${label} build directly redirects with location`);
    assert.match(html, expectedUsd, `${label} build is missing expected USD pricing`);
  }
  console.log('Built English pages are real HTML with expected USD pricing');
}

console.log('English USD pricing checks passed');
