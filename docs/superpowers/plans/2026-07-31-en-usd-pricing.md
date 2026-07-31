# English USD Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Rupiah amounts and remaining Indonesian form copy on English pricing/contact surfaces with fixed USD marketing values.

**Architecture:** Add explicit English pricing datasets beside the existing Indonesian source of truth. Locale-aware components/pages select one dataset at render time; no runtime exchange-rate service or mutable global configuration is introduced.

**Tech Stack:** Astro 6, TypeScript, static content data, existing Astro components.

---

## File Structure

- Modify `src/data/sewa-akun.ts`: define `SEWA_PLANS_EN` and `SEWA_RENTAL_EN` beside Indonesian data.
- Modify `src/components/sections/HomePricing.astro`: select ID or EN datasets from `Astro.currentLocale`.
- Modify `src/pages/en/layanan/sewa-akun.astro`: use English pricing plans.
- Modify `src/pages/en/kontak.astro`: translate remaining form copy and replace Rupiah budget options with USD ranges.
- Add `scripts/check-en-currency.mjs`: small stdlib-only regression check covering English/Indonesian currency markers.

### Task 1: Add a failing currency regression check

**Files:**
- Create: `scripts/check-en-currency.mjs`

- [ ] **Step 1: Create the check script**

```js
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const data = read('src/data/sewa-akun.ts');
const homePricing = read('src/components/sections/HomePricing.astro');
const enService = read('src/pages/en/layanan/sewa-akun.astro');
const enContact = read('src/pages/en/kontak.astro');
const idContact = read('src/pages/kontak.astro');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(data.includes('export const SEWA_PLANS_EN'), 'Missing SEWA_PLANS_EN');
assert(data.includes('export const SEWA_RENTAL_EN'), 'Missing SEWA_RENTAL_EN');
for (const value of ['$20 - $300', '$300 - $900', 'Above $900', "price: '$10'", "price: '$25'", "price: '$50'"]) {
  assert(data.includes(value), `Missing English price: ${value}`);
}
assert(homePricing.includes("lang === 'en' ? SEWA_PLANS_EN : SEWA_PLANS"), 'HomePricing does not select English plans');
assert(homePricing.includes("lang === 'en' ? SEWA_RENTAL_EN : SEWA_RENTAL"), 'HomePricing does not select English rental tiers');
assert(enService.includes('SEWA_PLANS_EN'), 'English service page does not use SEWA_PLANS_EN');
assert(!/Rp\s|\d+rb|\d+jt/i.test(enContact), 'English contact page still contains Rupiah markers');
for (const value of ['$300', '$600', '$1,500', '$3,000']) {
  assert(enContact.includes(value), `English contact page missing ${value}`);
}
assert(/Rp\s|\d+jt/i.test(idContact), 'Indonesian contact prices changed unexpectedly');
console.log('English USD pricing checks passed');
```

- [ ] **Step 2: Run the check and verify it fails**

Run:

```bash
node scripts/check-en-currency.mjs
```

Expected: exits non-zero with `Error: Missing SEWA_PLANS_EN`.

- [ ] **Step 3: Commit the failing check**

```bash
git add scripts/check-en-currency.mjs
git commit -m "test: add English USD pricing regression check"
```

### Task 2: Add dedicated English pricing datasets

**Files:**
- Modify: `src/data/sewa-akun.ts:83-137`

- [ ] **Step 1: Add `SEWA_PLANS_EN` after `SEWA_PLANS`**

```ts
export const SEWA_PLANS_EN: SewaPlan[] = [
  {
    name: 'Starter',
    tagline: '',
    price: '5%',
    unit: 'top-up fee',
    features: [
      '$20 - $300 per top-up',
      'Official Whitelist Account',
      'No VAT fees',
      'Partner-level appeal support',
      'Automatic balance transfer if disabled*',
      'Priority support (Standard)',
    ],
  },
  {
    name: 'Growth',
    tagline: '',
    price: '4.5%',
    unit: 'top-up fee',
    featured: true,
    features: [
      '$300 - $900 per top-up',
      'Official Whitelist Account',
      'No VAT fees',
      'Partner-level appeal support',
      'Automatic balance transfer if disabled*',
      'Priority support (Priority)',
    ],
  },
  {
    name: 'Scale',
    tagline: '',
    price: '3.5%',
    unit: 'top-up fee',
    features: [
      'Above $900 per top-up',
      'Official Whitelist Account',
      'No VAT fees',
      'Partner-level appeal support',
      'Automatic balance transfer if disabled*',
      'Priority support (VIP)',
    ],
  },
];
```

- [ ] **Step 2: Add `SEWA_RENTAL_EN` after `SEWA_RENTAL`**

```ts
export const SEWA_RENTAL_EN = {
  setup: 'Free',
  tiers: [
    { label: '1 Month', price: '$10' },
    { label: '3 Months', price: '$25' },
    { label: '6 Months', price: '$50' },
  ],
} as const;
```

- [ ] **Step 3: Run the regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected: still fails at `HomePricing does not select English plans`.

- [ ] **Step 4: Commit the datasets**

```bash
git add src/data/sewa-akun.ts
git commit -m "feat(pricing): add fixed English USD account-rental data"
```

### Task 3: Make homepage pricing locale-aware

**Files:**
- Modify: `src/components/sections/HomePricing.astro:1-40`

- [ ] **Step 1: Import both data variants**

Replace the data import with:

```astro
import { SEWA_PLANS, SEWA_PLANS_EN, SEWA_RENTAL, SEWA_RENTAL_EN } from '@data/sewa-akun';
```

- [ ] **Step 2: Select the active datasets after locale resolution**

```ts
const plans = lang === 'en' ? SEWA_PLANS_EN : SEWA_PLANS;
const rental = lang === 'en' ? SEWA_RENTAL_EN : SEWA_RENTAL;
```

- [ ] **Step 3: Render selected data**

Replace `SEWA_RENTAL.setup`, `SEWA_RENTAL.tiers`, and `SEWA_PLANS.map` with:

```astro
<span class="rental-value rental-free">{rental.setup}</span>
```

```astro
{rental.tiers.map((tier) => (
  <span class="rental-tier"><strong>{tier.price}</strong> / {tier.label}</span>
))}
```

```astro
{plans.map((p) => (
```

- [ ] **Step 4: Run the regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected: still fails at `English service page does not use SEWA_PLANS_EN`.

- [ ] **Step 5: Commit homepage locale selection**

```bash
git add src/components/sections/HomePricing.astro
git commit -m "fix(home): render USD pricing on English homepage"
```

### Task 4: Use English plans on the English account-rental page

**Files:**
- Modify: `src/pages/en/layanan/sewa-akun.astro:12-17,84-87`

- [ ] **Step 1: Import `SEWA_PLANS_EN` instead of `SEWA_PLANS`**

```astro
import {
  SEWA_HERO, META_WL, GOOGLE_WL, SEWA_PLANS_EN,
  SEWA_FAQS, SEWA_SEO, SEWA_KEYWORDS,
  INDUSTRIES, INDUSTRY_HEADING,
  type WhitelistInfo,
} from '@data/sewa-akun';
```

- [ ] **Step 2: Pass English plans to `PricingSection`**

```astro
<PricingSection plans={SEWA_PLANS_EN} service="Account Rental" />
```

- [ ] **Step 3: Run the regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected: progresses to English contact assertions and fails because Rupiah markers remain.

- [ ] **Step 4: Commit the English service page**

```bash
git add src/pages/en/layanan/sewa-akun.astro
git commit -m "fix(account-rental): use USD plans on English page"
```

### Task 5: Translate English contact form and budget ranges

**Files:**
- Modify: `src/pages/en/kontak.astro:77-133`

- [ ] **Step 1: Replace remaining Indonesian form copy**

Use these exact replacements:

```astro
<div id="form-sent" style="display:none;padding:14px;background:#DCFCE7;color:#15803D;border-radius:10px;font-size:14px;font-weight:600;">
  ✓ Message sent! We will reply as soon as possible.
</div>
```

```astro
<label for="kontak-website">Website (leave empty)</label>
```

```astro
<label for="kontak-name">Full Name *</label>
<input id="kontak-name" name="name" required type="text" autocomplete="name" placeholder="Your name" maxlength="100" pattern="[\p{L}\p{M}\s.\-']{2,100}"/>
```

```astro
<label for="kontak-phone">WhatsApp Number</label>
```

```astro
<label for="kontak-service">Service of Interest</label>
```

```astro
<option value="Digital Marketing Consultation">Digital Marketing Consultation</option>
<option value="Mix / Not Sure Yet">Mix / Not Sure Yet</option>
```

- [ ] **Step 2: Replace budget options with USD**

```astro
<label for="kontak-budget">Estimated Budget</label>
<select id="kontak-budget" name="budget">
  <option value="Not sure yet" selected>Not sure yet</option>
  <option value="< $300">&lt; $300</option>
  <option value="$300 - $600">$300 - $600</option>
  <option value="$600 - $1,500">$600 - $1,500</option>
  <option value="$1,500 - $3,000">$1,500 - $3,000</option>
  <option value="> $3,000">&gt; $3,000</option>
</select>
```

- [ ] **Step 3: Translate message and consent copy**

```astro
<label for="kontak-message">Tell Us About Your Project *</label>
<textarea id="kontak-message" name="message" required placeholder="Tell us about your business, goals, and what you are looking for..." maxlength="2000" minlength="10"></textarea>
```

```astro
Send Message <ArrowRight size={14} />
```

```astro
<p style="font-size:12px;color:var(--ink-500);">By submitting, you agree that we may contact you for follow-up. Your data will not be shared with third parties.</p>
```

- [ ] **Step 4: Run the regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected: `English USD pricing checks passed`.

- [ ] **Step 5: Confirm Indonesian values remain unchanged**

```bash
grep -nE 'Rp 5jt|Rp 10-25jt|Rp 25-50jt' src/pages/kontak.astro
grep -nE "150rb|350rb|792rb" src/data/sewa-akun.ts
```

Expected: ID contact options and ID rental tiers still appear.

- [ ] **Step 6: Commit contact form changes**

```bash
git add src/pages/en/kontak.astro
git commit -m "fix(contact): use English copy and USD budgets"
```

### Task 6: Final verification and production push

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run the regression check**

```bash
node scripts/check-en-currency.mjs
```

Expected: `English USD pricing checks passed`.

- [ ] **Step 2: Check for unexpected Indonesian currency markers on targeted English files**

```bash
grep -nEi 'Rp\s|[0-9]+rb|[0-9]+jt' \
  src/pages/en/kontak.astro \
  src/pages/en/layanan/sewa-akun.astro \
  src/components/sections/HomePricing.astro
```

Expected: no output from English contact/service page; `HomePricing.astro` may contain only imported ID symbol names, not literal Indonesian amounts.

- [ ] **Step 3: Run Astro validation**

```bash
bun run check && bun run build
```

Expected: both commands exit 0. If the known sandbox Vite/Cloudflare initialization hang recurs, stop the command, report it explicitly, and rely on the standalone regression check plus deployment CI.

- [ ] **Step 4: Push main to both remotes**

```bash
git push origin main
git push web-alf main
```

Expected: both remotes advance to the final implementation commit.
