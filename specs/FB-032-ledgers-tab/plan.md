# Plan: Ledgers tab with expandable ledger cards

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

Add a tab bar (`role="tablist"`) above the workspace. The Sequences tab renders today's
workspace; the Ledgers tab renders the FB-031 content inline as a page instead of a modal:
funds, investment form, active ledger controls or start form, ledger cards, history.
A new pure domain function derives the cards, so numbering, ordering and profit percentage
are testable and never stored. A card is a button with `aria-expanded` that toggles its
stats. Rejected: persisting the ledger number, since it is fully derivable from order.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/portfolio.ts` | `ledgerCards`, `profitPercent` | Pure |
| `src/App.tsx` | Tabs, Ledgers page, cards; remove modal and toolbar button | UI only |
| `src/App.css` | Tabs, cards | |
| `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js` | Tab-based steps, card scenarios | Dialog steps renamed |
| `README.md` | Describe tabs and cards | |

## Domain changes

```ts
interface LedgerCard { id; number; name; status: "active" | "closed";
  openedAt; closedAt: string | null; stats: ClosedLedgerStats; profitPercent: number;
  currency: Currency }
profitPercent(netResult, startingBalance): number   // ratio, 4 decimals
ledgerCards(portfolio, activeLedger): LedgerCard[]  // newest opening first
```

Closed ledgers are numbered by their position in `closedLedgers`; the active ledger is
`closedLedgers.length + 1`.

## Data and migration

None. `LedgerState`, `Portfolio`, `localStorage` and the cloud schema are unchanged.

## Test strategy

Steps move from the dialog to the Ledgers tab. New scenarios cover the tabs, numbering and
order, net result with profit percentage and expand and collapse. FB-031 scenarios keep
their intent.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hidden Sequences tab loses UI state | Annoying | Filters live in `App` state, so they survive |
| Percent rounding | Wrong figure | Ratio rounded to four decimals in the domain |

## Constitution check

Derived numbers are pure domain functions (III, IV); no stored shape change (VII).

## Rollback

Revert the implementation commit.
