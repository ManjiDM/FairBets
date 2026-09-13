# FairBets

A mobile-first, local-first tracker for automatic sequences of bets. A sequence begins with a bet, continues through losses or open outcomes, and closes on its next winning bet. The next sequence restarts from the configured base stake.

## Run locally

```bash
cd C:\Users\ctw01517\Desktop\betting-series-tracker
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite in a browser.

## Run the end-to-end scenarios

The E2E suite lives in this repository under `e2e/`; it is not a separate package. Feature files
use Gherkin language and are executed by Cucumber with Playwright step definitions. Install the
browser once, then run the suite from the repository root:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The test command starts the Vite app automatically and writes Cucumber HTML and JSON reports to
`dist/e2e/`. Run the Cucumber scenarios with a visible browser:

```bash
pnpm test:e2e:headed
```

Playwright is used by Cucumber for browser automation; there is no separate Playwright Test
suite. The single E2E suite is organized according to the Playwright-Cucumber structure:

```bash
e2e/features/       # Gherkin feature files
e2e/steps/          # Playwright-backed Cucumber step definitions
e2e/support/        # Browser lifecycle, World, and hooks
cucumber.json       # Cucumber paths and report configuration
```

The workbook-import and bet-management scenarios are defined in
`e2e/features/workbook-import.feature` and `e2e/features/bets.feature`. Their browser actions
are implemented by the Playwright-backed steps in `e2e/steps/fairbets.steps.js`; each scenario
therefore runs through the same Cucumber suite rather than being duplicated as a separate
Playwright spec.

Use `pnpm test:e2e:headed` to launch the same Cucumber/Playwright suite with a visible browser
and Playwright debugging enabled. Use `pnpm test:e2e` for the normal headless run.

## Enable Supabase cloud storage

Cloud storage is optional until a Supabase project is configured. It uses email magic-link authentication and row-level security so each user can only access their own FairBets ledger.

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor. If you deployed the earlier Series Ledger schema, run [`supabase/migrations/0002_fairbets_ledgers.sql`](./supabase/migrations/0002_fairbets_ledgers.sql) instead.
2. In Supabase Authentication settings, enable Email sign-in and add your local and deployed app URLs to the redirect allow list.
3. Copy `.env.example` to `.env.local`, then enter the project URL and the public anon key from Supabase Project Settings -> API.
4. Restart `pnpm dev`.

Do not put a Supabase service-role key in `.env.local` or in browser code. Once configured, use **Settings** -> **Cloud backup** to sign in, back up the current ledger, or restore the latest cloud copy. After a device is linked to a cloud ledger, local changes automatically sync.

## Import the workbook

Use **Import .xlsx** in Settings and choose `Betting2026.xlsx`. The importer recognizes the workbook's `DATETIME`, `BET`, and `ODD` columns, preserves recorded stakes where available, and automatically groups the imported bets into FairBets sequences.

## Included safeguards

- Open bets are shown as exposure, not silently counted as settled losses.
- Every winning bet closes its sequence; the following bet starts a fresh sequence at the base stake.
- Suggested and manually entered stakes are limited by the configured maximum stake.
- The dashboard warns when open exposure or recorded stakes exceed configured limits.
- The application is a private tracker only. It does not place bets or claim to predict outcomes.
