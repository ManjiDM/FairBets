# Tasks: Place Add Bet beside sequence filters

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-10 |

> Ordered, small, individually verifiable steps. Domain logic first, then UI, then
> scenarios, then docs. Tick each box as it lands. If the order turns out to be wrong,
> update this file rather than improvising silently.

## 1. Domain

Not required; no domain logic changes.

## 2. Persistence and migration

Not required; no data shape or storage changes.

## 3. UI

- [x] **T-020** — Move the global Add Bet control beside the status filters and shorten
  the "All" label.
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: the Add Bet and status filter controls share a row at desktop and small
    phone widths, and Add Bet behavior remains unchanged.
  - Verify: related Cucumber scenarios and `pnpm build`

## 4. Scenarios

- [x] **T-030** — Cover toolbar label, placement, activation, and mobile overflow.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: acceptance scenarios from `spec.md` pass through the single Playwright-
    backed Cucumber suite.
  - Verify: `pnpm test:e2e`

## 5. Documentation

Not required; this is self-contained UI behavior documented in the feature and spec.

## 6. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario in `spec.md` is confirmed satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Redesign the description search or sequence filter styling | Out of scope | Separate request |
