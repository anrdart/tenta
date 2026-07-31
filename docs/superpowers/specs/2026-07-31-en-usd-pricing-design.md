# English USD Pricing Design

## Goal

Ensure English account-rental and contact pages display fixed USD marketing prices instead of Indonesian Rupiah values. Indonesian pages remain unchanged.

## Scope

### English account-rental data

Add dedicated English exports in `src/data/sewa-akun.ts`:

- `SEWA_PLANS_EN`
  - Starter top-up range: `$20 - $300`
  - Growth top-up range: `$300 - $900`
  - Scale top-up range: `Above $900`
  - Keep percentage fees: `5%`, `4.5%`, `3.5%`
  - Translate plan units and feature labels to English.
- `SEWA_RENTAL_EN`
  - 1 Month: `$10`
  - 3 Months: `$25`
  - 6 Months: `$50`
  - Setup: `Free`

The Indonesian exports `SEWA_PLANS` and `SEWA_RENTAL` remain unchanged.

### English account-rental page

Update `src/pages/en/layanan/sewa-akun.astro` to consume `SEWA_PLANS_EN`. Any rental tier component or section used by this page must receive `SEWA_RENTAL_EN` instead of Indonesian data.

### English contact form

Update `src/pages/en/kontak.astro` budget options:

- `Not sure yet`
- `< $300`
- `$300 - $600`
- `$600 - $1,500`
- `$1,500 - $3,000`
- `> $3,000`

Translate nearby labels, placeholders, consent text, and option labels that are still Indonesian. Field names and submission behavior remain unchanged.

## Architecture

Use fixed English datasets rather than runtime FX conversion. These are stable marketing prices, not live exchange-rate calculations. This avoids external dependencies, inconsistent rounding, and client/server currency differences.

## Non-goals

- No live currency API.
- No currency selector separate from language.
- No changes to Indonesian prices.
- No conversion of legal/disclaimer examples unless they are rendered in the English account-rental or English contact flow.

## Verification

- Confirm the English account-rental page contains the defined USD ranges and no `Rp`, `rb`, or `jt` price strings.
- Confirm the English contact page contains the USD budget ranges and no Rupiah budget options.
- Confirm Indonesian account-rental and contact pages retain their original Rupiah values.
- Run the existing Astro check/build when the environment allows it.
