# English Pricing Reference Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every English pricing surface use the approved 5%/4%/3% monthly-spend tiers and $31/$75/$169 rental values without changing Indonesian pricing or website layouts.

**Architecture:** Keep `SEWA_PLANS_EN` and `SEWA_RENTAL_EN` as the sole English pricing source. Existing locale-aware components keep selecting ID/EN datasets, while legacy pricing/USD routes delete their duplicated arrays and import the canonical English data. The standalone source/build regression check protects canonical values, route wiring, Indonesian values, and rendered English HTML.

**Tech Stack:** Astro 6, TypeScript, Node.js stdlib assertions, existing Cloudflare build adapter.

---

## File Structure

- Modify `scripts/check-en-currency.mjs`: encode approved values, reject superseded values, require shared-data wiring, verify built English/legacy USD HTML.
- Modify `src/data/sewa-akun.ts`: update only `SEWA_PLANS_EN` and `SEWA_RENTAL_EN`.
- Modify `src/components/sections/lp/WhitelistLpPage.astro`: English promo starts at `$31`.
- Modify `src/pages/meta-whitelist-pricing.astro`: delete duplicate English plans; use `SEWA_PLANS_EN` for EN locale.
- Modify `src/pages/google-whitelist-pricing.astro`: same shared-data wiring.
- Modify `src/pages/meta-whitelist-usd.astro`: delete duplicate USD plans; use `SEWA_PLANS_EN`; render `$31` rental promo.
- Modify `src/pages/google-whitelist-usd.astro`: same shared-data wiring.

No CSS or layout files change.

### Task 1: Strengthen the pricing regression check

**Files:**
- Modify: `scripts/check-en-currency.mjs`

- [ ] **Step 1: Read every pricing source needed by the check**

Add:

```js
const whitelistLp = read('src/components/sections/lp/WhitelistLpPage.astro');
const metaPricing = read('src/pages/meta-whitelist-pricing.astro');
const googlePricing = read('src/pages/google-whitelist-pricing.astro');
const metaUsd = read('src/pages/meta-whitelist-usd.astro');
const googleUsd = read('src/pages/google-whitelist-usd.astro');
const plansId = exportBlock(data, 'SEWA_PLANS');
```

- [ ] **Step 2: Replace old English canonical assertions**

Require these exact fee/range/feature values inside `SEWA_PLANS_EN`:

```js
for (const [label, pattern] of [
  ['Starter 5%', /name:\s*['"]Starter['"][\s\S]*?price:\s*['"]5%['"]/],
  ['Growth 4%', /name:\s*['"]Growth['"][\s\S]*?price:\s*['"]4%['"]/],
  ['Scale 3%', /name:\s*['"]Scale['"][\s\S]*?price:\s*['"]3%['"]/],
  ['$0 - $10,000 monthly spend', /['"]Monthly spend: \$0 - \$10,000['"]/],
  ['$11,000 - $50,000 monthly spend', /['"]Monthly spend: \$11,000 - \$50,000['"]/],
  ['$51,000 - $100,000 monthly spend', /['"]Monthly spend: \$51,000 - \$100,000['"]/],
  ['Official Whitelist Ad Account', /['"]Official Whitelist Ad Account['"]/],
  ['No VAT / Tax Markup', /['"]No VAT \/ Tax Markup['"]/],
  ['Partner Support Appeal', /['"]Partner Support Appeal['"]/],
  ['Automatic Balance Migration', /['"]Automatic Balance Migration \(Terms & Conditions apply\)['"]/],
  ['Standard Priority Support', /['"]Standard Priority Support['"]/],
  ['Priority Support', /['"]Priority Support['"]/],
  ['VIP Support', /['"]VIP Support['"]/],
]) {
  assert.match(plansEn, pattern, `Missing approved English value: ${label}`);
}
```

Require approved rentals:

```js
for (const [price, pattern] of [
  ['$31', /price:\s*['"]\$31['"]/],
  ['$75', /price:\s*['"]\$75['"]/],
  ['$169', /price:\s*['"]\$169['"]/],
]) {
  assert.match(rentalEn, pattern, `Missing approved English rental: ${price}`);
}
```

- [ ] **Step 3: Reject superseded English values**

```js
for (const [label, pattern] of [
  ['Growth 4.5%', /price:\s*['"]4\.5%['"]/],
  ['Scale 3.5%', /price:\s*['"]3\.5%['"]/],
  ['old Starter range', /\$20 - \$300 per top-up/],
  ['old Growth range', /\$300 - \$900 per top-up/],
  ['old Scale range', /Above \$900 per top-up/],
]) {
  assert.doesNotMatch(plansEn, pattern, `Superseded English value remains: ${label}`);
}
for (const oldRental of ['$10', '$25', '$50']) {
  assert.doesNotMatch(rentalEn, new RegExp(`price:\\s*['"]\\${oldRental}['"]`), `Superseded English rental remains: ${oldRental}`);
}
```

- [ ] **Step 4: Protect Indonesian plan data explicitly**

```js
for (const [label, pattern] of [
  ['Starter 5%', /name:\s*'Starter'[\s\S]*?price:\s*'5%'/],
  ['Growth 4,5%', /name:\s*'Growth'[\s\S]*?price:\s*'4,5%'/],
  ['Scale 3,5%', /name:\s*'Scale'[\s\S]*?price:\s*'3,5%'/],
  ['300rb - 5jt', /Sekali topup 300rb - 5jt/],
  ['5jt - 15jt', /Sekali topup 5jt - 15jt/],
  ['above 15jt', /Topup di atas 15jt/],
]) {
  assert.match(plansId, pattern, `Indonesian pricing changed: ${label}`);
}
```

Keep existing exact Indonesian rental and contact assertions.

- [ ] **Step 5: Require shared-data route wiring and `$31` promos**

```js
for (const [label, source] of [
  ['Meta pricing', metaPricing],
  ['Google pricing', googlePricing],
  ['Meta USD', metaUsd],
  ['Google USD', googleUsd],
]) {
  assert.match(source, /SEWA_PLANS_EN/, `${label} does not consume SEWA_PLANS_EN`);
  assert.doesNotMatch(source, /const\s+(?:englishPlans|usdPlans)\s*=/, `${label} still duplicates English plans`);
}
assert.match(whitelistLp, /lang\s*===\s*['"]en['"]\s*\?\s*['"]\$31['"]\s*:\s*['"]Rp150\.000['"]/, 'Whitelist LP English promo must start at $31');
for (const [label, source] of [['Meta USD', metaUsd], ['Google USD', googleUsd]]) {
  assert.match(source, /startingPrice\s*=\s*['"]\$31['"]/, `${label} rental promo must start at $31`);
  assert.doesNotMatch(source, /promoPrice\s*=|originalPrice\s*=/, `${label} still renders obsolete access promo pricing`);
}
```

- [ ] **Step 6: Extend strict build-output checks**

Replace expected USD patterns with approved values and add both legacy USD pages:

```js
const builtPages = [
  ['dist/client/en/index.html', /\$31\b/, 'English homepage'],
  ['dist/client/en/kontak/index.html', /\$300\b/, 'English contact'],
  ['dist/client/en/layanan/sewa-akun/index.html', /Monthly spend:\s*(?:\$|&#(?:36|x24);)0\s*-\s*(?:\$|&#(?:36|x24);)10,000/i, 'English account-rental'],
  ['dist/client/meta-whitelist-usd/index.html', /(?:\$|&#(?:36|x24);)31\b/, 'Meta USD pricing'],
  ['dist/client/google-whitelist-usd/index.html', /(?:\$|&#(?:36|x24);)31\b/, 'Google USD pricing'],
];
```

The existing redirect-document assertions and `--require-build` missing-file behavior remain unchanged.

- [ ] **Step 7: Run the source-mode check and verify RED**

```bash
rm -rf dist
node scripts/check-en-currency.mjs
```

Expected: non-zero exit at the first missing approved English value, such as `Missing approved English value: Growth 4%`.

- [ ] **Step 8: Commit the failing regression update**

```bash
git add scripts/check-en-currency.mjs
git commit -m "test(pricing): enforce approved English reference values"
```

### Task 2: Update canonical English pricing and LP promo

**Files:**
- Modify: `src/data/sewa-akun.ts`
- Modify: `src/components/sections/lp/WhitelistLpPage.astro`

- [ ] **Step 1: Replace only `SEWA_PLANS_EN`**

```ts
export const SEWA_PLANS_EN: SewaPlan[] = [
  {
    name: 'Starter',
    tagline: '',
    price: '5%',
    unit: 'top-up fee',
    features: [
      'Monthly spend: $0 - $10,000',
      'Official Whitelist Ad Account',
      'No VAT / Tax Markup',
      'Partner Support Appeal',
      'Automatic Balance Migration (Terms & Conditions apply)',
      'Standard Priority Support',
    ],
  },
  {
    name: 'Growth',
    tagline: '',
    price: '4%',
    unit: 'top-up fee',
    featured: true,
    features: [
      'Monthly spend: $11,000 - $50,000',
      'Official Whitelist Ad Account',
      'No VAT / Tax Markup',
      'Partner Support Appeal',
      'Automatic Balance Migration (Terms & Conditions apply)',
      'Priority Support',
    ],
  },
  {
    name: 'Scale',
    tagline: '',
    price: '3%',
    unit: 'top-up fee',
    features: [
      'Monthly spend: $51,000 - $100,000',
      'Official Whitelist Ad Account',
      'No VAT / Tax Markup',
      'Partner Support Appeal',
      'Automatic Balance Migration (Terms & Conditions apply)',
      'VIP Support',
    ],
  },
];
```

- [ ] **Step 2: Replace only `SEWA_RENTAL_EN` values**

```ts
export const SEWA_RENTAL_EN = {
  setup: 'Free',
  tiers: [
    { label: '1 Month', price: '$31' },
    { label: '3 Months', price: '$75' },
    { label: '6 Months', price: '$169' },
  ],
} as const;
```

- [ ] **Step 3: Update the shared English LP promo**

```astro
<LpPromoBanner lang={lang} startingPrice={lang === 'en' ? '$31' : 'Rp150.000'} />
```

- [ ] **Step 4: Run the check**

```bash
node scripts/check-en-currency.mjs
```

Expected: canonical data assertions pass; failure moves to a legacy route that still does not consume `SEWA_PLANS_EN`.

- [ ] **Step 5: Confirm Indonesian data is unchanged**

```bash
grep -nE "price: '4,5%'|price: '3,5%'|300rb - 5jt|5jt - 15jt|Topup di atas 15jt|150rb|350rb|792rb|Rp150\.000" \
  src/data/sewa-akun.ts src/components/sections/lp/WhitelistLpPage.astro
```

Expected: all listed Indonesian values remain.

- [ ] **Step 6: Commit canonical pricing**

```bash
git add src/data/sewa-akun.ts src/components/sections/lp/WhitelistLpPage.astro
git commit -m "feat(pricing): sync English plans and rental to approved reference"
```

### Task 3: Deduplicate locale-aware legacy pricing routes

**Files:**
- Modify: `src/pages/meta-whitelist-pricing.astro`
- Modify: `src/pages/google-whitelist-pricing.astro`

- [ ] **Step 1: Import both canonical datasets**

In each file:

```ts
import { SEWA_PLANS, SEWA_PLANS_EN } from '@data/sewa-akun';
```

- [ ] **Step 2: Delete the complete `englishPlans` array**

Remove from `const englishPlans: typeof SEWA_PLANS = [` through its closing `];`.

- [ ] **Step 3: Select canonical data by locale**

```ts
const plans = lang === 'en' ? SEWA_PLANS_EN : SEWA_PLANS;
```

Keep each existing `PricingSection`, service name, page structure, tracking, and CTA unchanged.

- [ ] **Step 4: Run source-mode regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected: pricing-route assertions pass; failure remains on one of the USD routes still defining `usdPlans`.

- [ ] **Step 5: Commit locale-aware route cleanup**

```bash
git add src/pages/meta-whitelist-pricing.astro src/pages/google-whitelist-pricing.astro
git commit -m "refactor(pricing): reuse canonical English plans in legacy pricing routes"
```

### Task 4: Deduplicate legacy USD routes and rental promo

**Files:**
- Modify: `src/pages/meta-whitelist-usd.astro`
- Modify: `src/pages/google-whitelist-usd.astro`

- [ ] **Step 1: Import the canonical English plans**

In each file add:

```ts
import { SEWA_PLANS_EN } from '@data/sewa-akun';
```

- [ ] **Step 2: Delete each complete `usdPlans` array**

Remove from `const usdPlans = [` through its closing `];`.

- [ ] **Step 3: Render canonical plans**

```astro
<PricingSection plans={SEWA_PLANS_EN} service="Meta Ads Whitelist (USD)" lang="en" />
```

Use the equivalent existing Google service name in the Google route.

- [ ] **Step 4: Replace obsolete access promos with rental starting price**

```astro
<LpPromoBanner lang="en" startingPrice="$31" />
```

This removes `$12` and `$5 / account` from both routes.

- [ ] **Step 5: Run source-mode regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected:

```text
Built English pages not found; skipped build-output checks
English USD pricing checks passed
```

- [ ] **Step 6: Commit USD route cleanup**

```bash
git add src/pages/meta-whitelist-usd.astro src/pages/google-whitelist-usd.astro
git commit -m "refactor(pricing): reuse canonical plans in legacy USD routes"
```

### Task 5: Build verification and integration

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run Astro diagnostics**

```bash
bun run check
```

Expected: `0 errors`, `0 warnings`.

- [ ] **Step 2: Run the production build**

```bash
bun run build
```

Expected: build completes and post-build output includes:

```text
Built English pages are real HTML with expected USD pricing
English USD pricing checks passed
```

- [ ] **Step 3: Run strict check independently**

```bash
node scripts/check-en-currency.mjs --require-build
```

Expected: both success lines above.

- [ ] **Step 4: Verify approved and rejected values**

```bash
grep -nE "price: '4%'|price: '3%'|\$0 - \$10,000|\$11,000 - \$50,000|\$51,000 - \$100,000|\$31|\$75|\$169" src/data/sewa-akun.ts
grep -nE "4\.5%|3\.5%|\$20 - \$300|\$300 - \$900|Above \$900|\$10|\$25|\$50" src/pages/*whitelist*.astro
```

Expected: first command shows approved English values; second command has no duplicated old English pricing arrays. Indonesian comma-decimal values remain only in canonical ID data and ID-rendered paths.

- [ ] **Step 5: Verify no layout files changed**

```bash
git diff --name-only HEAD~4..HEAD | grep -E 'src/styles|HomePricing\.astro|PricingSection\.astro'
```

Expected: no output.

- [ ] **Step 6: Check repository state**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; clean feature branch except repository-local ignored/untracked tooling directories outside the worktree.

- [ ] **Step 7: Integrate after review**

After spec review, code-quality review, and final verification:

```bash
git checkout main
git merge --no-ff feat/english-pricing-reference-sync -m "Merge: sync English pricing to approved reference"
git push origin main
git push web-alf main
```

Expected: both remotes point at the verified merge commit.
