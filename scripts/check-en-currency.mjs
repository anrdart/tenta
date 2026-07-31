import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const data = read('src/data/sewa-akun.ts');
const homePricing = read('src/components/sections/HomePricing.astro');
const enRentalPage = read('src/pages/en/layanan/sewa-akun.astro');
const enContact = read('src/pages/en/kontak.astro');
const idContact = read('src/pages/kontak.astro');

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

console.log('English USD pricing checks passed');
