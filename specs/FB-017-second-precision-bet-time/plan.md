# Plan: Add seconds to bet placement time

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-05 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Keep `placedAt` as the single chronological source of truth. Make the entry/edit
control use second precision and preserve the timestamp's fractional milliseconds in
saved state. Display the placement time through seconds, while keeping milliseconds
hidden. Remove the bet-ID fallback from chronological sorting.

When a new or edited placement time collides at second precision, assign the next
available millisecond within that second. Preserve an edited bet's existing millisecond
when its visible second has not changed. On load/import, normalize exact duplicate
timestamps deterministically in stable source order so legacy minute-precision records
also become uniquely timestamp-ordered. Keep timestamps as local wall-clock strings,
consistent with the existing `datetime-local` input and Supabase timestamp-without-time-zone
column.

The alternative of retaining the ID tie-breaker was rejected because it makes bet
order unrelated to the placement timestamp. Using the internal recording timestamp
for collisions was also rejected: it represents entry time and must remain separate
from the user-entered placement time under FB-013.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Sort chronologically by placement timestamp only; add deterministic millisecond collision normalization and allocation | Pure helpers; preserve input order when normalizing legacy duplicates |
| `src/App.tsx` | Use a seconds-precision date/time input, retain milliseconds on unchanged edits, allocate collision milliseconds on changed/new timestamps, display seconds, and persist normalized legacy values | Keep FB-013 recording timestamp behavior unchanged |
| `src/lib/cloudStore.ts` | Order cloud rows deterministically by placement time then recording time before duplicate normalization | Existing database column supports fractional seconds |
| `e2e/features/bets.feature` | Cover second ordering, same-second collisions, reload/edit retention, and unchanged sequence-card recording order | |
| `e2e/steps/fairbets.steps.js` | Add any required precision and timestamp-order assertions | |
| `specs/FB-017-second-precision-bet-time/*` | Track plan, implementation, and verification | |

## Domain changes

```ts
export function normalizePlacementTimestamps(bets: Bet[]): Bet[];
export function nextPlacementTimestamp(bets: Bet[], enteredAt: string): string;
```

`normalizePlacementTimestamps` is pure and deterministic. It preserves unique
timestamps, and assigns unused millisecond values within the same visible second to
duplicate timestamps in input order. `nextPlacementTimestamp` preserves the entered
second and uses the next available millisecond in that second, or `.000` if unused.
Both reject invalid dates and fail explicitly if no millisecond remains in a second.

`compareBets` uses only parsed `placedAt` timestamp values. The normalization invariant
ensures persisted duplicate timestamps are resolved before ledger calculation; sorting
does not use bet IDs or recording timestamps.

## Data and migration

- **`LedgerState` shape:** unchanged; `placedAt` retains its existing string type.
- **`localStorage` migration:** no shape migration. Normalize duplicate timestamps when
  loading and persist the normalized values along with existing metadata backfills.
- **Cloud schema:** no new migration. The existing timestamp-without-time-zone column
  supports milliseconds. Sort cloud rows by `placed_at` then `created_at` before
  deterministic normalization.
- **Backward compatibility:** minute-precision values parse as second-zero values.
  Duplicate exact timestamps are assigned milliseconds in stable input order without
  changing their displayed second.
- **Workbook import:** no layout change. Imported timestamps pass through the same
  normalization before calculation.

## UI changes

Set the placement `datetime-local` input step to one second and generate default draft
values through seconds. Editing presents local wall time through seconds; if the user
does not change that visible value, retain the exact existing millisecond timestamp.
For a changed or new visible second, use the domain helper to allocate an unused
millisecond within that second. Display dates as before but include numeric seconds;
never display milliseconds.

Sequence card ordering continues to use FB-013's `createdAt`. Financial progression,
legacy grouping, and sequence calculations use only normalized `placedAt` timestamps.

## Test strategy

- Add a red E2E case for two bets within one minute and verify chronological placement
  ordering at second resolution.
- Add same-second collision coverage, assert unique stored millisecond timestamps and
  identical displayed seconds.
- Edit and reload a bet to confirm seconds and its millisecond ordering are preserved.
- Verify legacy minute-precision duplicate records load and normalize deterministically.
- Verify changing placement times does not change FB-013 sequence-card recording order.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Editing loses subsecond precision | Existing same-second order changes unexpectedly | Preserve the original stored timestamp when the visible second is unchanged |
| Legacy exact-time duplicates remain unresolved | ID fallback continues to affect order | Normalize duplicates in deterministic stored/imported order before calculation |
| Millisecond allocation crosses into the next second | Displayed time changes without user input | Fail explicitly when all 1000 millisecond slots are used |
| Cloud duplicates normalize differently on reload | Order changes after restore | Order cloud rows by placement time and recording time before normalization |
| Recording order and placement order are conflated | Backdated sequence cards move unexpectedly | Keep `createdAt` sequence-card ordering untouched |

## Constitution check

- I-II: The control remains local-first and usable offline.
- III-IV: Timestamp allocation and normalization are pure deterministic domain rules;
  UI submits and renders values only.
- V-VI: Existing sequence and risk rules remain; changed chronological timestamps
  intentionally recalculate progression according to the spec.
- VII: Existing data remains readable; timestamp column and ledger shape do not change.
- VIII: No secrets are introduced.
- IX-X: Gherkin covers precision, ties, persistence, and ordering; all gates run.

## Rollback

Revert seconds display/input and collision assignment. Millisecond values serialize in
the existing timestamp field, remain valid to older readers, and display as the same
second, so no destructive rollback migration is required.
