# Plan: Order bets by recording time and show odds as the default title

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-02 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Persist an optional `createdAt` timestamp on each bet and use it only for sequence
card ordering and display numbering. New bets get a strictly increasing timestamp
relative to existing bets so rapid consecutive entries remain ordered. Editing a bet
preserves its original timestamp.

Reuse Supabase's existing `created_at` column rather than adding a schema migration.
Cloud parsing maps it to the bet timestamp, cloud writes preserve it, and its existing
database default covers records created by older clients. Existing local records
without it receive synthetic timestamps once, in their persisted array order, then
are saved locally. Workbook imports receive timestamps in source row order. When the
domain is given an unstamped bet directly, placement time remains a deterministic
fallback.

Only sequence presentation order changes: sequence calculations, legacy grouping,
and bet order within a sequence continue using placement time. Display ordering sorts
sequences by the timestamp of the sequence's first recorded bet, then reverses for
newest-first display. Auto-generated `Selection NN` labels are rendered as the
formatted odds in the title position; user-entered labels remain as titles. The
timestamp itself is never rendered.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Add optional `createdAt`; sort sequences by recording time for stable display numbering | Financial progression remains placement-time based |
| `src/App.tsx` | Stamp new bets, backfill legacy local records, preserve timestamps on edit, and render odds for generated titles | Timestamp remains hidden |
| `src/lib/cloudStore.ts` | Map bet `createdAt` to existing Supabase `created_at` | No new cloud column |
| `src/domain/workbookImport.ts` | Stamp imported bets in workbook row order | Workbook format unchanged |
| `e2e/features/bets.feature` | Cover tied placement times, creation order, hidden timestamp, and generated title replacement | |
| `e2e/steps/fairbets.steps.js` | Add sequence-card order assertion if needed | |
| `specs/FB-013-recording-order-and-odds-title/*` | Track plan, implementation, and verification | |

## Domain changes

```ts
export interface Bet {
  createdAt?: string;
}
```

`createdAt` is optional for backward compatibility. It MUST NOT affect `compareBets`,
sequence assignment, stake, settlement, or recovery calculations. Sequence output
ordering and sequence numbers use the earliest valid recording timestamp among their
bets, with placement time and stable ID fallback for unstamped or equal timestamps.

## Data and migration

- **`LedgerState` shape:** Bets gain optional `createdAt`.
- **`localStorage` migration:** For bets without `createdAt`, assign increasing
  timestamps in their existing stored-array order and persist the upgraded ledger.
- **Cloud schema:** Unchanged. Use existing `public.bets.created_at`; map it in cloud
  reads and preserve it in upserts.
- **Backward compatibility:** Older cloud rows already have `created_at`. Missing
  local timestamps are backfilled in array order. Domain callers without one continue
  to calculate normally.
- **Workbook import:** Keep accepted columns unchanged; stamp imported records in row
  order.

## UI changes

Sequence cards continue to show the user-entered placement date/time, but sort newest
recorded sequence first. The internal recording timestamp is never shown. If a bet
label matches the legacy auto-generated `Selection NN` form, its prominent title is
the odds followed by “odds”; custom labels remain prominent. The label field
placeholder describes the label as optional rather than suggesting generated
selection numbers.

## Test strategy

- Add a failing E2E case for two entries with tied placement time and assert the second
  recorded sequence is first.
- Add a backdated new entry and assert it appears first without changing existing
  placement-time-based sequence calculation.
- Assert blank/generated labels show odds as their title and no “Selection NN”
  heading, while custom labels remain unchanged.
- Reload and confirm order remains stable.
- Run `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.
- Review cloud parser/writer compatibility; no live cloud round-trip is available
  without credentials.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Recording time leaks into UI | Confusing or noisy bet details | Keep it out of render components and assert it is absent in E2E |
| Timestamp tie or clock rollback misorders rapid additions | New item may not appear first | Generate each new timestamp later than the maximum existing valid timestamp |
| Existing local arrays are not creation-ordered | Legacy display jumps after migration | Use the stored order as the one-time deterministic fallback |
| `created_at` changes during cloud upsert | Cloud restore reorders bets | Explicitly write the original timestamp during upsert |
| Placement chronology changes financial sequence math | Repriced or regrouped history | Keep calculation sort independent of createdAt; alter only sequence display ordering |
| Custom labels are replaced by odds | User notes are lost | Replace only the known generated `Selection NN` presentation |

## Constitution check

- I-VIII: Private local-first tracker; no financial rules or data compatibility are
  weakened.
- IX: Ordering and title behavior are specified and tested in Gherkin.
- X: All existing gates must pass.

## Rollback

Revert presentation ordering and the optional `createdAt` field mapping. Supabase's
existing `created_at` data remains untouched; local timestamps can be ignored by old
code. No schema rollback or destructive data migration is necessary.
