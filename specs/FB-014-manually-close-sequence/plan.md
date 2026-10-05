# Plan: Manually close a sequence after a loss

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-05 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Represent manual closure as an optional `sequenceManuallyClosed` marker on the
sequence's final lost bet. The domain accepts closure only when the requested sequence
exists, remains active, and its latest bet is lost with no open exposure. The
calculation treats that terminal loss as closed without changing any calculated bet
values, ledger totals, or sequence membership. Existing win-based closure remains
unchanged.

Use a close action on eligible active sequence cards, both one-bet and multi-bet. The
action calls the domain transition and persists the updated bet through the existing
local/cloud ledger flow. A closed sequence exposes neither the close action nor the
continue (+) action. Closing makes the sequence cease to count as an active
FB-012 recovery reserver; global recovery is recalculated from current settled P&L and
expected profit for a later independent bet.

Add the optional marker to the cloud bet schema with a default of false, using an
additive migration. Keep it optional in local data parsing so existing ledgers load
unchanged; the cloud parser accepts the database defaulted boolean. Workbook imports
do not set the marker.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Add manual-close metadata and a validated pure transition; derive closed status from the terminal lost bet | No financial arithmetic changes |
| `src/App.tsx` | Validate persisted metadata, expose the eligible close action, persist the transition, and show feedback | Applies to single- and multi-bet sequence cards |
| `src/lib/cloudStore.ts` | Parse and save the manual-close marker | Preserve restore and sync behavior |
| `supabase/schema.sql` | Add `sequence_manually_closed` with a false default | Fresh-install schema |
| `supabase/migrations/0007_manual_sequence_closure.sql` | Add the column for existing deployments | Additive; no data rewrite |
| `e2e/features/bets.feature` | Cover manual close, ineligible open sequence, totals, reload, and recovery release | |
| `e2e/features/bet-strategy.feature` | Cover FB-012 recovery reservation while another sequence remains active | |
| `e2e/steps/fairbets.steps.js` | Add steps for close visibility and action if needed | |
| `specs/FB-014-manually-close-sequence/*` | Track implementation and verification | |

## Domain changes

```ts
export interface Bet {
  sequenceManuallyClosed?: boolean;
}

export function closeSequenceAfterLoss(
  bets: Bet[],
  sequenceId: string,
  settings: StrategySettings,
): Bet[];
```

The transition throws for a missing, already closed, open, or non-loss-terminated
sequence. It returns a new array with only the terminal lost bet marked. Calculation
must not alter bet profit, expected profit, settled totals, or recovery snapshots.

## Data and migration

- **`LedgerState` shape:** Bets gain optional `sequenceManuallyClosed`.
- **`localStorage` migration:** Not required; the optional property is absent/false for
  all existing bets. New values persist in the existing ledger object.
- **Cloud schema:** Add `sequence_manually_closed boolean not null default false` to
  `public.bets` with migration `0007_manual_sequence_closure.sql`; parse and upsert
  the field in `src/lib/cloudStore.ts`.
- **Backward compatibility:** Existing local entries remain valid. Existing cloud
  rows receive false from the database default; no existing sequence becomes
  manually closed.
- **Workbook import:** Unchanged; imported sequences continue to close on wins.

## UI changes

An active sequence card whose latest bet is lost shows **Close sequence**. Sequences
with an open bet, a win, or a prior manual closure do not show it. Closing updates the
status to **Closed**, keeps all outcomes and financial totals unchanged, hides the
sequence continuation button, and shows a success message. Closed sequences are not
reopened or extended; the main Add Bet action creates a separate sequence.

## Test strategy

- Add a regression that closes a lost sequence and verifies status, unchanged settled
  P&L, hidden continuation action, and persistence after reload.
- Verify no close action appears while the latest bet is open.
- Verify closing the only active recovery-reserving loss sequence allows a new
  independent bet to recover the current FB-009 goal-adjusted gap.
- Verify closing one of two active recovery-reserving sequences does not release
  recovery under FB-012.
- Verify the multi-bet sequence card can be manually closed after its latest bet is
  lost.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.
- Review cloud migration and parser/writer changes; live cloud restore requires
  configured credentials.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Closing a sequence changes recorded financial results | Misleading ledger totals | Store closure only as metadata on the terminal loss; do not create or edit bets |
| Closing one recovery sequence releases another's allocation | Duplicate global recovery | Continue deriving reservations from active sequences, as FB-012 specifies |
| An open bet is treated as an accepted loss | Exposure disappears from the ledger | Permit the transition only when the latest bet is lost |
| Manual closure is lost on restore | Sequence reopens and suppresses recovery | Persist the marker locally and in the cloud |
| Closed sequence remains continuable | User accidentally extends an accepted loss | Gate close and plus controls on calculated sequence status |

## Constitution check

- I-II: Local-first storage remains primary; cloud persistence is backup/sync only.
- III-IV: The domain owns the deterministic close transition and status; UI only
  invokes it and renders the result.
- V: Manual close is the spec's explicit exception after a settled loss. Wins still
  close automatically; open bets are never hidden or settled implicitly.
- VI: No stake or exposure validation changes.
- VII: Optional local metadata and an additive cloud migration preserve existing data.
- IX-X: E2E scenarios cover each user-visible behavior and all repository gates run.

## Rollback

Revert the close action and domain transition. The optional marker can remain in local
data and the additive cloud column can remain unused; no recorded bets or outcomes
need to be removed or rewritten.
