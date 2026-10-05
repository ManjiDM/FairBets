# Plan: Filter bets by description

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Done |
| Updated | 2026-10-05 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Keep the query as transient UI state on the Sequences view. Match it against the same
formatted description users see: the custom label followed by `@ <formatted odds>`,
or only `@ <formatted odds>` when no custom label is present. Trim surrounding query
whitespace and compare case-insensitively using substring matching.

Apply the existing Active/Closed filter and the description filter when selecting
sequences. Keep a sequence if at least one bet matches, then render only those matching
bets in that sequence while a query is active. Apply the same description predicate to
standalone cancelled records. Clearing the query returns each sequence's full bet list.
Filtering is presentation-only and leaves the calculation and persisted ledger intact.

An alternative was to hide/show entire sequences based on whether any child bet
matches, while continuing to display all bets in a matching sequence. That would leave
nonmatching descriptions visible and make the filter less useful, so only matching
child bets will render.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Add transient query state, shared description formatting/matching, and apply filters to sequence and cancelled records | No ledger or calculation mutation |
| `src/App.css` | Style the search input and consistently display the odds suffix | Reuse existing form styles |
| `e2e/features/bets.feature` | Cover partial/case-insensitive matching, multi-bet sequence filtering, clearing, and `@` odds display | |
| `e2e/steps/fairbets.steps.js` | Add assertions and input steps for the search | |
| `specs/FB-016-bet-description-filter/*` | Track plan, tasks, and verification | |

## Domain changes

None. This is a view-only operation. Description formatting and matching operate on
already calculated bet records and do not calculate or modify financial values.

## Data and migration

- **`LedgerState` shape:** unchanged.
- **`localStorage` migration:** not needed; query state is transient.
- **Cloud schema:** unchanged.
- **Backward compatibility:** existing custom labels and automatic labels remain
  unchanged in persisted data. Automatic labels continue to be omitted from the
  description; the formatted odds are displayed as `@ <odds>`.
- **Workbook import:** unchanged.

## UI changes

Add a labeled search input beside the current sequence-status controls. Match against
the complete displayed description (including odds) by trimmed, case-insensitive
substring. A multi-bet sequence stays in the list if one of its bets matches, and only
those bets are rendered while the query is non-empty. Cancelled-only records in their
separate section use the same filter. An empty or whitespace-only query restores all
records permitted by the status filter. A no-results message explains that the search
did not match.

All bet cards display the description and odds as `Description @ 1.20`; the placement
date is shown separately. Automatically generated descriptions display `@ 1.20`
without a placeholder label.

## Test strategy

- Cover substring and case-insensitive matching with multiple independent bets.
- Cover filtering individual bet rows in a multi-bet sequence while keeping the parent
  sequence visible.
- Cover clearing the search and no-match behavior.
- Cover filtering standalone cancelled records.
- Update existing odds-display assertions to expect `@ <odds>`.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| A matching sequence continues to show nonmatching bets | Search results remain noisy | Filter child bet rows as well as parent sequences |
| Odds formatting differs between display and search | Partial searches for displayed odds fail | Share one formatter for rendering and matching |
| Filtering changes ledger calculations | Financial totals become inconsistent | Keep filtering in presentation-only state and assert existing calculation behavior through regression suite |
| Empty search hides records | User may mistake the ledger for empty | Treat empty/whitespace-only query as no filter |

## Constitution check

- I-II: Search remains in the private local-first UI and does not require connectivity.
- III-IV: Search does not alter deterministic domain calculations; UI only filters and
  renders calculated records.
- V-VI: Sequence membership, outcomes, and risk limits remain unchanged.
- VII: No persisted data or schemas change.
- VIII: No secrets are introduced.
- IX-X: Gherkin scenarios cover the user-visible behavior and all project gates run.

## Rollback

Revert the UI search and formatting changes. There is no persisted query state, schema
change, or bet data migration to reverse.
