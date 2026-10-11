# Tasks: Start fresh confirmation modal

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [x] **T-001** — Start fresh scenarios and the modal-based step
  - Files: `e2e/features/start-fresh.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the new scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. Domain

- [x] **T-010** — `clearLedgerHistory`
  - Files: `src/domain/portfolio.ts`
  - Done when: FR-6 and FR-8 hold
  - Verify: scenarios

## 3. UI

- [x] **T-020** — Modal with two switches, Confirm and Cancel
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-5, FR-7 and FR-9 hold
  - Verify: `pnpm test:e2e`

## 4. Docs

- [x] **T-040** — README
  - Files: `README.md`
  - Done when: the Start fresh options are described

## 5. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed
