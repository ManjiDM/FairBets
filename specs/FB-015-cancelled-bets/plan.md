# Plan: Record cancelled bets

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Done |
| Updated | 2026-10-05 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Add `cancelled` as a neutral bet outcome, and derive all balances, expectation,
sequence progress, and win/loss counters from that rule. Recalculate sequence stake
suggestions chronologically from non-cancelled results. When a prior win is changed
to cancelled, later recorded outcomes remain intact and the affected sequence status
is recomputed from its remaining wins and manual-close marker.

Cancelled records remain in the calculated bet list. If all bets in a sequence are
cancelled, omit that group from sequence counts and expose its records in a separate
cancelled-bets display. If a sequence has any non-cancelled bet, cancelled bets stay
inside that sequence. A cancelled final bet in an active sequence is eligible for the
existing plus control and continuation uses the unchanged sequence recovery totals.

Allow result correction from the bet editor for every outcome, and provide a direct
Cancelled action beside Won/Lost on open bets. Cancellation state is the existing
outcome field, so local storage requires no structural migration. Add `cancelled` to
cloud outcome validation and replace the database outcome constraint with an
additive migration.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Extend outcomes and make cancellation neutral in calculations; expose standalone cancelled records | Preserve sequence recovery chronology |
| `src/App.tsx` | Allow outcome correction, display Cancelled, render standalone cancelled cards, allow continuing cancelled sequence tails | |
| `src/lib/cloudStore.ts` | Accept and persist Cancelled outcome | Existing outcome column |
| `supabase/schema.sql` | Include cancelled in the fresh-schema outcome constraint | |
| `supabase/migrations/0008_cancelled_bet_outcome.sql` | Replace outcome constraint for existing databases | Additive constraint change |
| `e2e/features/bets.feature` | Cover cancellation, sequence continuation, correction/reopening, and reload | |
| `e2e/steps/fairbets.steps.js` | Add cancelled-result and standalone record assertions | |
| `specs/FB-015-cancelled-bets/*` | Track implementation and verification | |

## Domain changes

```ts
export type Outcome = "open" | "won" | "lost" | "cancelled";
```

Cancelled contributes zero to profit, expected profit, open exposure, win/loss counts,
and sequence recovery progress. It remains in the displayed bet history. A group with
only cancelled bets is not returned as a sequence; those records are returned
separately. Sequence stakes and final active/closed status are recalculated from
chronological outcomes and explicit manual-close state.

## Data and migration

- **`LedgerState` shape:** Outcome's accepted values gain `cancelled`; no other local
  fields change.
- **`localStorage` migration:** Not required; existing Open/Won/Lost values remain
  valid.
- **Cloud schema:** Keep the existing `outcome` text column; update its check in
  `supabase/schema.sql` and migration `0008_cancelled_bet_outcome.sql`; cloud parsers
  accept the new value.
- **Backward compatibility:** Existing ledgers and imported workbooks keep current
  outcomes; workbook layout is unchanged.
- **Standalone cancelled records:** Persist their existing bet IDs and fields but
  exclude them from sequence membership/counts when their entire group is cancelled.

## UI changes

Open bet rows offer Won, Lost, and Cancelled actions. The edit-result selector supports
all four outcomes so users can correct previously settled results or reverse a
cancellation. Cancelled records show a Cancelled status and zero P&L. Standalone
cancelled records appear in history without an Active/Closed sequence badge or
sequence number. Existing sequences keep cancelled bets in their history; a cancelled
tail does not close the sequence and displays the existing plus button.

## Test strategy

- Add E2E cases for cancelling an open bet, zero P&L/exposure, and unchanged settled
  balance.
- Cover cancelled standalone records remaining visible without sequence counts.
- Cover a cancelled bet inside a loss sequence and continuing from the unchanged
  recovery gap.
- Correct a loss and a closing win to Cancelled; assert updated P&L, expected profit,
  and active/closed state.
- Verify a sequence containing only cancelled bets is omitted from sequence count.
- Verify cancellation persists after reload.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.
- Review cloud parser and migration; a live cloud round-trip requires configured
  credentials.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Cancelled bet counted as settled loss | Wrong balance and recovery | Treat it as zero result and exclude it from win/loss counters |
| Cancelled standalone counted as a sequence | Misleading status/counts | Separate all-cancelled groups from sequence output |
| Removing a prior win leaves stale closed status | Sequence cannot continue correctly | Recompute status from all remaining outcomes after every calculation |
| Cancelled tail cannot continue recovery | User must create an unrelated sequence | Let active sequence plus eligibility include cancelled tail outcomes |
| Existing cloud outcome constraint rejects value | Cloud sync fails | Ship schema update and numbered constraint migration together |

## Constitution check

- I-II: Cancellation is usable locally; cloud is optional.
- III-IV: All result arithmetic and sequence derivation remain deterministic domain
  behavior; the UI only submits outcomes and renders calculated state.
- V: Cancellation is neutral, does not close a sequence, and does not count as a
  sequence by itself. Existing win closure and FB-014 manual closure remain.
- VI: Open exposure is released on cancellation; no limits or stake validation are
  weakened.
- VII: Existing local, cloud, and workbook records remain compatible.
- IX-X: Gherkin scenarios and all existing gates cover the change.

## Rollback

Revert UI/domain support for the new outcome. Keep the additive SQL migration and
outcome values in the database; existing records remain valid and no data deletion is
needed.
