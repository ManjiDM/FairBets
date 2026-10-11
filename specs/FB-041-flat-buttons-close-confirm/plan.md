# Plan: Flat buttons and Confirm close

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

- `src/App.css`: remove the lift from `.button:hover`, the shadows from
  `.button-primary` (and its hover), and give `.button-primary:hover:not(:disabled)` the
  `#cde58a` background that only the icon-only variant had. Drop the now redundant
  icon-only overrides.
- `src/App.tsx`: render `Confirm close` instead of `Close ledger` while `closeConfirm`.
- `e2e`: steps for flat buttons, pressing Close ledger only, and asserting visibility.

## Affected modules

`src/App.css`, `src/App.tsx`, `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`.

## Data and migration impact

None.

## Risks

The `.button-secondary` class has no styles of its own; it keeps the browser default look
and is not in scope beyond losing the lift.

## Rollback

Revert the feat commit.

## Constitution check

- [x] Presentation only
