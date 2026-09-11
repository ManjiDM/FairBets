# Series Ledger

A mobile-first, local-first tracker for betting series and recovery plans. It records bets, shows settled and open exposure separately, calculates a suggested stake from configurable rules, and keeps a local copy in the browser. It can also back up and restore a private series through Supabase/PostgreSQL.

## Run locally

```bash
cd C:\Users\ctw01517\Desktop\betting-series-tracker
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite in a browser.

## Enable Supabase cloud storage

Cloud storage is optional until a Supabase project is configured. It uses email magic-link authentication and row-level security so each user can only access their own series.

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. In Supabase Authentication settings, enable Email sign-in and add your local and deployed app URLs to the redirect allow list.
3. Copy `.env.example` to `.env.local`, then enter the project URL and the public anon key from Supabase Project Settings -> API.
4. Restart `pnpm dev`.

Do not put a Supabase service-role key in `.env.local` or in browser code. Once configured, use **Settings** -> **Cloud backup** to sign in, back up the current series, or restore the latest cloud copy. After a device is linked to a cloud series, local changes automatically sync.

## Import the workbook

Use **Import Excel** and choose `Betting2026.xlsx`. The importer recognizes the workbook's `DATETIME`, `BET`, and `ODD` columns, preserves recorded stakes where available, and imports the base stake, starting balance, goal rate, threshold, and rounding settings.

## Included safeguards

- Open bets are shown as exposure, not silently counted as settled losses.
- Suggested and manually entered stakes are limited by the configured maximum stake.
- The dashboard warns when open exposure or recorded stakes exceed configured limits.
- The application is a private tracker only. It does not place bets or claim to predict outcomes.
