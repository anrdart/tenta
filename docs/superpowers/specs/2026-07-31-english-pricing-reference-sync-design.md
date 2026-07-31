# English Pricing Reference Sync Design

## Goal

Synchronize every English pricing surface with the approved Tentaklik reference image while preserving all Indonesian pricing and existing layouts.

## Approved English Values

### Top-up plans

| Plan | Fee | Monthly spend |
|---|---:|---:|
| Starter | 5% | $0 - $10,000 |
| Growth | 4% | $11,000 - $50,000 |
| Scale | 3% | $51,000 - $100,000 |

### Rental

- Account setup: Free
- 1 Month: $31
- 3 Months: $75
- 6 Months: $169
- English whitelist LP promo: Rent from $31 / account

### Plan features

- Official Whitelist Ad Account
- No VAT / Tax Markup
- Partner Support Appeal
- Automatic Balance Migration (Terms & Conditions apply)
- Starter: Standard Priority Support
- Growth: Priority Support
- Scale: VIP Support

## Architecture

`SEWA_PLANS_EN` and `SEWA_RENTAL_EN` in `src/data/sewa-akun.ts` remain the canonical English pricing source. English homepage and account-rental pages continue consuming these exports.

Legacy Meta/Google pricing and USD routes must import `SEWA_PLANS_EN` instead of defining duplicate English arrays. Indonesian routes continue selecting `SEWA_PLANS` and `SEWA_RENTAL` unchanged.

The shared whitelist LP promo selects `$31` for English and `Rp150.000` for Indonesian.

## Scope

Update all English pricing surfaces:

- English homepage pricing
- `/en/layanan/sewa-akun`
- `/en/whitelist/metaads`
- `/en/whitelist/gads`
- Legacy Meta Whitelist pricing/USD routes
- Legacy Google Whitelist pricing/USD routes

The route names may not carry an `/en` prefix for legacy USD pages, but any explicitly English/USD plan data rendered there must use the canonical English dataset.

## Presentation

Existing website layouts, cards, responsive behavior, CTA links, form behavior, and visual styling remain unchanged. This change updates pricing values, monthly-spend labels, and associated feature copy only.

Pages that do not currently render rental details will not gain a new rental section.

## Indonesian Preservation

The following Indonesian values remain unchanged:

- Starter 5%, Growth 4.5%, Scale 3.5%
- Existing Rupiah top-up ranges
- Rental 150rb / 350rb / 792rb
- Indonesian whitelist LP promo Rp150.000 / akun

## Regression Protection

Extend `scripts/check-en-currency.mjs` to:

- Require the approved English fees, monthly-spend ranges, rental prices, and feature wording in the canonical dataset.
- Reject legacy English values: Growth 4.5%, Scale 3.5%, `$10/$25/$50`, and old `$20-$300/$300-$900/Above $900` ranges.
- Require legacy pricing/USD routes to import or otherwise consume `SEWA_PLANS_EN`, preventing duplicate English arrays.
- Confirm Indonesian fees, top-up ranges, rental values, and LP Rupiah promo remain unchanged.
- Verify built English HTML contains approved values and is not a redirect document.

The normal build command continues running the strict post-build English pricing check.

## Non-goals

- No redesign based on the reference image.
- No live currency conversion.
- No changes to Indonesian pricing.
- No new rental section on pages that currently omit one.
- No route or permalink changes.
