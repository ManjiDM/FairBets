# Plan: Ledger lifecycle with investments and closing statistics

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-10 |

## Approach

Keep `LedgerState` and its storage key untouched for the active ledger. Add a portfolio
record stored under its own `localStorage` key: the investments, the closed ledgers and
the active ledger's opening time (null when none is active). All money rules are pure
functions in a new domain module that take timestamps and ids as arguments. The UI adds a
Ledgers dialog opened from the top toolbar with the funds summary, an investment form, the
active ledger with a two-step Close action, the closed ledgers with final statistics, a
timestamped history, and, when no ledger is active, a Start ledger form pre-filled from
the latest ledger. When no ledger is active, adding bets is disabled and a notice explains
why.

Rejected: embedding investments and history inside `LedgerState`. It would change the
cloud payload and every parser, and the cloud backup is explicitly out of scope.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/portfolio.ts` | New: types, funds overview, close, start, invest, history, migration, settings validation | Pure, no clock |
| `src/App.tsx` | Portfolio state and persistence, Ledgers dialog, disabled add-bet with no active ledger | UI only, calls domain |
| `src/App.css` | Dialog sections, history list | |
| `e2e/features/ledgers.feature` | New feature | |
| `e2e/steps/fairbets.steps.js` | New steps | |
| `README.md` | Document ledgers and funds | |

## Domain changes

```ts
interface Investment { id: string; amount: number; recordedAt: string }
interface ClosedLedgerStats { startingBalance; finalBalance; netResult; totalStaked;
  wins; losses; winRate; closedSequences }
interface ClosedLedger { id: string; ledger: LedgerState; openedAt: string;
  closedAt: string; stats: ClosedLedgerStats }
interface Portfolio { activeOpenedAt: string | null; investments: Investment[];
  closedLedgers: ClosedLedger[] }
summariseLedger(ledger): ClosedLedgerStats
fundsOverview(portfolio, activeStartingBalance): { totalInvested; realisedResult; availableFunds }
addInvestment(portfolio, amount, recordedAt, id): Result<Portfolio>
closeLedger(portfolio, ledger, closedAt, id): Result<Portfolio>   // blocked by open bets
startLedger(portfolio, ledger, openedAt): Result<Portfolio>      // funds + settings checks
historyEvents(portfolio, activeLedgerName): HistoryEvent[]
migrateToPortfolio(ledger, nowIso, id): Portfolio
```

Money uses the existing ledger calculation, so closing statistics equal what the ledger
showed. Sums are rounded to cents.

## Data and migration

- **`LedgerState` shape:** unchanged
- **`localStorage`:** new key `fairbets-portfolio-v1`. When absent, the saved ledger
  becomes the active ledger with an initial investment equal to its starting balance,
  stamped at first load.
- **Cloud schema:** unchanged; history is local-only
- **Backward compatibility:** the ledger key and legacy keys keep working

## UI changes

As in the spec. The Start fresh and demo actions in Settings remain and act on the active
ledger only.

## Test strategy

New `ledgers.feature` covers funds, investments, closing, blocking with open bets,
starting above and at the funds limit, one active ledger at a time, history order, the
no-active-ledger state and migration from a pre-portfolio save. The existing suite stays
green.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Float drift in funds | Wrong limit | Round to cents in domain |
| Closing loses bets | Data loss | The closed record stores the whole ledger |
| Placeholder ledger when none is active | Confusing UI | Notice and disabled add-bet |

## Constitution check

Money rules are pure (III) and in the domain (IV); sequence model unchanged (V);
local-first (II); migration forward-only (VII).

## Rollback

Revert the implementation commit; the portfolio key is ignored by the previous version.
