---
applyTo: "src/domain/**/*.ts"
---

# Domain logic instructions

`src/domain/` is the auditable core of FairBets. Every figure a user sees must be
reproducible from here.

## Rules

- Export **pure, deterministic** functions. No randomness, no `Date.now()`, no `Math.random()`,
  no I/O, no `localStorage`, no network, no React imports.
- Time-dependent values are passed in as parameters, never read from the clock.
- Keep functions small and single-purpose so a stake calculation can be traced by reading
  one function.
- Preserve the shape `LedgerState = { ledgerName, settings, bets }`.
- `Bet` keeps its fields consistent: `id`, `placedAt`, `label`, `odds`, `outcome`, and the
  optional `stakeOverride`.
- Honour `StrategySettings` exactly: `baseStake`, `goalRate`, `threshold`,
  `recoveryWeight`, `stakeRounding`, `maxStake`, `maxOpenExposure`, `currency`. Use the
  existing rounding and validation helpers instead of introducing new assumptions.
- `maxStake` and `maxOpenExposure` are hard ceilings. No code path returns a value above
  them.
- Sequence model: begins at `baseStake`, continues through losses and open outcomes,
  closes on the next win, then restarts at `baseStake`. Open bets are exposure — never
  treated as settled losses.
- `workbookImport.ts` keeps accepting the documented `DATETIME` and `ODD`/`ODDS` columns
  and the legacy layout. Parsing stays defensive: reject bad rows explicitly rather than
  coercing them into plausible-looking numbers.

## Before changing money rules

Changes to stake or sequence math require a spec under `specs/` with worked numeric
examples, per [`../../specs/README.md`](../../specs/README.md).

## Verify

```bash
pnpm lint
pnpm build
```

Then confirm the worked examples in the spec's business-rules table.
