# Tasks: Start fresh confirmation modal

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [ ] **T-001** — Start fresh scenarios and the modal-based step
  - Files: `e2e/features/start-fresh.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the new scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. Domain

- [ ] **T-010** — `clearLedgerHistory`
  - Files: `src/domain/portfolio.ts`
  - Done when: FR-6 and FR-8 hold
  - Verify: scenarios

## 3. UI

- [ ] **T-020** — Modal with two switches, Confirm and Cancel
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-5, FR-7 and FR-9 hold
  - Verify: `pnpm test:e2e`

## 4. Docs

- [ ] **T-040** — README
  - Files: `README.md`
  - Done when: the Start fresh options are described

## 5. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Each acceptance scenario confirmed
