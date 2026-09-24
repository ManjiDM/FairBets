---
applyTo: "src/App.tsx,src/main.tsx,src/**/*.css"
---

# UI layer instructions

`src/App.tsx` is the UI and state container. It renders, collects input, persists, and
syncs — it does not compute money.

## Rules

- **No stake or sequence math here.** Import it from `src/domain/`. If the calculation
  does not exist yet, add it to the domain module first.
- Browser persistence and legacy `localStorage` migration belong in this layer. Keep
  existing migration paths working; never drop a legacy key without an upgrade path.
- The app must work fully with no network and no Supabase configuration. Cloud features
  degrade silently to local-only behaviour.
- Validation messages are specific and user-facing. Reject invalid odds (`<= 1`), blank
  placed times, and stakes above `maxStake` with a clear message rather than a silent
  no-op.
- Surface open bets as exposure, and warn when open exposure or recorded stakes approach
  or exceed configured limits.
- Keep copy descriptive, never promissory. This is a tracker, not a prediction or
  betting-placement tool.
- Mobile-first: new UI must remain usable at small viewport widths.
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` may be read in browser code.

## Verify

```bash
pnpm lint
pnpm build
pnpm test:e2e
```

UI behaviour changes need matching scenarios in `e2e/features/`.
