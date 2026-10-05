# Plan: Show bet recording time with second precision

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-05 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Keep the two existing time values for distinct purposes:

- `placedAt` remains the editable, user-entered time used by chronological sequence
  calculations. Extend the input to seconds and preserve that precision on save/edit.
- `createdAt` remains the time a bet is added to FairBets and becomes the only key for
  visible sequence and bet-row ordering. Display this time through seconds, without
  milliseconds. Do not display `placedAt` on bet cards.

The existing recording-time generator already advances by milliseconds beyond the
latest recorded bet, so newly created records in one displayed second can be uniquely
ordered. Extend local/cloud stamping to normalize duplicate valid `createdAt` values,
as well as missing values, in deterministic source order. Keep financial calculation
ordering based on `placedAt`. Keep sequence-card grouping and the FB-013 newest-first
sequence ordering based on the first bet's recording timestamp.

Do not replace `createdAt` with a second-resolution timestamp: that would reintroduce
ties for quick successive entries. Do not use placement time or IDs as visible-list
sort keys; either would contradict the clarified requirement.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Normalize missing/duplicate `createdAt` values deterministically; retain strictly increasing recording timestamp generation | Leave placement-time calculation comparator unchanged |
| `src/App.tsx` | Make placement input second-precision; display `createdAt` to seconds; sort bet rows by `createdAt`; show recording time in sequence headers | Keep `placedAt` editable and used for calculation only |
| `src/lib/cloudStore.ts` | Order cloud rows by placement time and recording time before normalization | No schema change |
| `e2e/features/bets.feature` | Cover placement-second retention, recording-time card/row ordering, same-second creation, and edit/reload stability | Update FB-013 assertion that recording time is not displayed |
| `e2e/steps/fairbets.steps.js` | Add recording timestamp assertions and seconds display assertions | |
| `specs/FB-017-second-precision-bet-time/*` | Track plan, implementation, and verification | |

## Domain changes

```ts
export function stampBets(bets: UnstampedBet[], settings: StrategySettings): Bet[];
export function nextBetRecordingTimestamp(bets: Bet[], now: number): string;
```

`stampBets` continues to backfill missing recording timestamps and strategy metadata.
It will additionally detect duplicate valid `createdAt` values and assign distinct
millisecond values in input order, without changing the displayed second. The operation
is pure and deterministic.

`nextBetRecordingTimestamp` continues to return a timestamp greater than `now` and all
existing recording times, ensuring same-second additions remain unique. The
calculation comparator continues to use `placedAt`; visible row sorting uses
`createdAt` in the UI. Sequence ordering continues to use the recording time of the
first recorded sequence bet.

## Data and migration

- **`LedgerState` shape:** unchanged; use existing `placedAt` and `createdAt`.
- **`localStorage` migration:** no shape change. Persist when `stampBets` adds missing
  metadata or normalizes duplicate recording timestamps.
- **Cloud schema:** no migration; timestamp columns already retain fractional seconds.
  Fetch ties with deterministic `created_at` ordering before normalization.
- **Backward compatibility:** minute-precision `placedAt` remains valid. Missing or
  duplicate recording timestamps receive stable unique values. Displayed card time is
  recording time, not placement time.
- **Workbook import:** keep columns unchanged. Imported bets already pass through
  recording-time stamping and duplicate normalization.

## UI changes

Set the placement `datetime-local` input to one-second steps. Format default drafts and
edit values through seconds so old minute-precision values become `:00` and saved
seconds survive editing. Continue saving the entered placement time for calculations.

Display each bet's `createdAt` using the current date/time style plus numeric seconds.
Do not show milliseconds or `placedAt` on bet cards. Display sequence-card date
information from recording times. Render rows inside active and collapsed sequences in
ascending `createdAt` order, independent of calculation order.

## Test strategy

- Add acceptance cases that fail before implementation for second-precision input and
  recording-time display/order.
- Add two bets within the same displayed recording second and assert distinct,
  increasing stored `createdAt` millisecond values while display hides milliseconds.
- Verify a backdated bet still appears first when it was recorded later.
- Verify bet rows in a sequence follow recording order even when placement-time order
  differs.
- Verify editing placement time does not change `createdAt` or the visible order.
- Verify legacy records with duplicate or missing `createdAt` values normalize
  deterministically and survive reload.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Placement time accidentally controls list order | Backdated entries appear in the wrong visible position | Sort rendered bet rows by `createdAt` and assert it in E2E |
| Milliseconds leak into the UI | Unreadable timestamps | Format recording time to whole seconds |
| Duplicate legacy `createdAt` values remain | Ordering falls back to IDs or input accident | Normalize duplicates by deterministic source order before rendering |
| Editing placement time changes recording order | User sees a bet move unexpectedly | Preserve `createdAt` when editing an existing bet |
| Recording timestamps are confused with calculation chronology | Financial progression changes unexpectedly | Keep domain calculations on `placedAt` |

## Constitution check

- I-II: Recording time is local-first and does not require network access.
- III-IV: Calculation chronology remains deterministic domain behavior; the UI only
  presents rows in recording order.
- V-VI: Sequence calculations and risk limits remain intact, except expected
  chronological refinements from second-level placement input.
- VII: No persisted shape or database migration is needed; legacy records are normalized
  compatibly.
- VIII: No secrets are introduced.
- IX-X: Gherkin covers visible ordering/precision and all required gates run.

## Rollback

Revert second-level placement input, recording-time card presentation, and row
presentation ordering. Fractional recording timestamps remain compatible with older
readers and do not require a destructive migration.
