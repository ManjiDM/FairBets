# Plan: [Feature name]

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Draft \| Approved \| In progress \| Done |
| Updated | YYYY-MM-DD |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

A short narrative of the technical solution. Name the alternative you rejected and why.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | | |
| `src/domain/workbookImport.ts` | | |
| `src/App.tsx` | | |
| `src/lib/cloudStore.ts` | | |
| `supabase/schema.sql` | | |
| `features/*.feature` | | |
| `e2e/features/*.feature` | | |
| `e2e/steps/fairbets.steps.js` | | |
| `README.md` | | |

Delete rows that do not apply.

## Domain changes

Signatures of new or changed exports in `src/domain/`, with the invariants each one
holds. Keep every function pure and deterministic.

```ts
// example
export function suggestStakeForOdds(/* ... */): number
```

## Data and migration

- **`LedgerState` shape:** unchanged \| changed as follows ...
- **`localStorage` migration:** not needed \| read legacy shape X and upgrade to Y
- **Cloud schema:** unchanged \| new migration `supabase/migrations/NNNN_*.sql` plus
  matching parser updates in `src/lib/cloudStore.ts`
- **Backward compatibility:** how existing saved ledgers keep working

## UI changes

Which screens, which controls, which validation messages. State how the UI reads results
from `src/domain/` rather than calculating anything itself.

## Test strategy

- Product scenarios added or changed in `features/`
- Executable scenarios added or changed in `e2e/features/`
- New or changed steps in `e2e/steps/`
- Manual checks that cannot be automated, and why

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| | | |

## Constitution check

Restate how the approach satisfies [`../constitution.md`](../constitution.md), especially
III (deterministic domain), IV (UI/domain separation), V (sequence model), VI (risk
limits), and VII (data compatibility). Flag any tension explicitly.

## Rollback

How to revert safely if this ships and turns out to be wrong — particularly if persisted
data was migrated.
