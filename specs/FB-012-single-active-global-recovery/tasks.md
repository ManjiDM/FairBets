# Tasks: Prevent duplicate global recovery allocations

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-02 |

> Ordered, small, individually verifiable steps. Domain logic first, then acceptance
> regression, then documentation and gates.

## 1. Regression scenario

- [x] **T-001** — Cover suppression of a second recovery allocation and release after
  the recovery owner closes.
  - Files: `e2e/features/bet-strategy.feature`
  - Done when: the scenario fails against current behavior at the second suggested
    stake and verifies only the residual shortfall after owner closure.
  - Verify: `pnpm test:e2e`

- [x] **T-002** — Cover a losing active sequence with no FB-009 snapshot suppressing
  duplicate global recovery.
  - Files: `e2e/features/bet-strategy.feature`
  - Done when: an active loss-recovery sequence keeps its own continuation suggestion
    and a new independent bet is suggested at base stake, including when multiple
    active sequences are recovering losses.
  - Verify: `pnpm test:e2e`

## 2. Domain behavior

- [x] **T-010** — Suppress the new-sequence recovery gap while an active sequence has
  a positive recovery gap or positive FB-009 snapshot.
  - Files: `src/domain/ledger.ts`
  - Done when: loss-recovery sequences and unsettled FB-009 allocations reserve the
    global gap; other open sequences do not; recovery resumes after owners close.
  - Verify: `pnpm test:e2e`

## 3. Documentation

- [x] **T-020** — Mark the spec verified and align plan/tasks with implementation.
  - Files: `specs/FB-012-single-active-global-recovery/*`
  - Done when: decisions and verification match shipped behavior.
  - Verify: review

## 4. Gates

- [x] **T-030** — `pnpm lint` passes
- [x] **T-031** — `pnpm build` passes
- [x] **T-032** — `pnpm test:e2e` passes
- [x] **T-033** — Every acceptance scenario in `spec.md` is satisfied
