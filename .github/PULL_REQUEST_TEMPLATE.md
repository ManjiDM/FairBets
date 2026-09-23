## Spec

<!-- Link the spec directory, e.g. specs/001-stake-rounding-modes/. -->
<!-- Trivial changes (typos, dependency bumps, formatting) may write "not required". -->

- Spec:
- Plan:
- Tasks:

## What changed

<!-- Summary of the behaviour change, in user terms. -->

## Acceptance scenarios

<!-- List each scenario from the spec and how it was confirmed. -->

| Scenario | Verified how |
| --- | --- |
| | |

## Data impact

- [ ] `LedgerState` shape unchanged
- [ ] No `localStorage` migration needed
- [ ] No cloud schema change
- [ ] Workbook import layout unchanged

<!-- Tick what applies. For anything unticked, describe the migration path and how
     existing saved ledgers keep working. -->

## Constitution check

<!-- See specs/constitution.md. Flag any principle this change puts under tension. -->

- [ ] Stake and sequence math stayed in `src/domain/` as pure, deterministic functions
- [ ] Open bets remain exposure, never silently settled losses
- [ ] `maxStake` and `maxOpenExposure` remain hard limits
- [ ] App still works offline with no Supabase configuration
- [ ] No secrets added; only `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` used in the browser

## Gates

- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e` (or not applicable — state why)
- [ ] `README.md` and affected docs updated
