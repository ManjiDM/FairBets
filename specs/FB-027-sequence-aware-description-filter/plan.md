# Plan: Sequence-aware description filter

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-10 |

## Approach

Replace the per-bet visibility filter with a per-sequence decision: a sequence is shown
when its card label or any of its bet descriptions matches, and then all its bets are
rendered. The card label is derived by one helper shared by the filter and by the card
headings, so the searched text is always the text shown. Rejected: matching nested bet
position labels too, which would make "Bet 1" match most multi-bet sequences.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Add sequence label helper and sequence-level match; render all bets of shown sequences | Presentation only |
| `e2e/features/bets.feature` | New scenarios; update the stale hidden-bet assertion | |
| `e2e/steps/fairbets.steps.js` | Steps for whole-sequence visibility if needed | |

## Domain changes

None. Matching is a UI presentation concern over already calculated sequences.

## Data and migration

- **`LedgerState` shape:** unchanged
- **`localStorage` migration:** not needed
- **Cloud schema:** unchanged
- **Backward compatibility:** nothing persisted changes

## UI changes

Filter input behaviour only. Placeholder text may mention the sequence label.

## Test strategy

- Scenarios in `e2e/features/bets.feature` for whole-sequence display and label search.
- Update "Filter individual bets within a sequence" to expect all bets visible.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Label text drifts from filter text | Search misses a card | One shared helper |

## Constitution check

No money math touched (III, IV). Sequence model and persisted data unchanged (V, VII).

## Rollback

Revert the implementation commit; no data migration is involved.
