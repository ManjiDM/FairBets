# Tasks: Use a consistent icon set

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

Not required; no persisted data changes.

## 3. UI

- [x] **T-020** — Add Lucide React and replace application-owned custom icons.
  - Files: `package.json`, `pnpm-lock.yaml`, `src/App.tsx`, `src/App.css`
  - Done when: all active action, drawer, and guardrail icons use the same library;
    names, titles, behavior, and sizing are preserved.
  - Verify: `pnpm lint`, `pnpm build`

## 4. Scenarios

- [x] **T-030** — Confirm icon and sequence behavior coverage.
  - Files: `e2e/features/fairbets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: current icon-only and sequence disclosure scenarios remain valid; update
    assertions only if needed for the library-rendered icons.
  - Verify: `pnpm test:e2e`

## 5. Documentation

- [x] **T-040** — Record the selected icon system and finished implementation in the
  spec artifacts.
  - Files: `specs/FB-019-consistent-icon-library/*`
  - Done when: plan, task status, and spec status match the delivered implementation.
  - Verify: review

## 6. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario in `spec.md` is confirmed satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Replace non-icon text buttons | Out of scope | Separate request |
