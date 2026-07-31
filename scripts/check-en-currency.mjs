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

for (const [value, pattern] of [
  ['$20 - $300', /price:\s*['"]\$20 - \$300['"]/],
  ['$300 - $900', /price:\s*['"]\$300 - \$900['"]/],
  ['Above $900', /price:\s*['"]Above \$900['"]/],
]) {
  assert.match(plansEn, pattern, `Missing price: '${value}' in SEWA_PLANS_EN`);
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
assert.match(enRentalPage, /plans\s*=\s*\{\s*SEWA_PLANS_EN\s*\}/, 'English account-rental page does not use SEWA_PLANS_EN');

assert.doesNotMatch(enContact, /\b(?:Rp|rb|jt)\b|\d+(?:[.,]\d+)?\s*(?:rb|jt)\b/i, 'English contact contains IDR markers');
for (const value of ['$300', '$600', '$1,500', '$3,000']) {
  assert.ok(enContact.includes(value), `Missing ${value} in English contact`);
}
assert.match(idContact, /\bRp\b/, 'Indonesian contact is missing Rp markers');
assert.match(idContact, /\d+(?:[.,]\d+)?\s*jt\b/i, 'Indonesian contact is missing jt markers');

console.log('English USD pricing checks passed');
