# Tasks: Split CI pipelines by purpose

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-02 |

> Ordered, small, individually verifiable steps. Tick each box as it lands.

## Workflow split

- [x] **T-001** — Keep only lint and production build in the CI quality workflow.
  - Files: `.github/workflows/ci.yml`
  - Done when: lint/build run on push, pull request, and manual dispatch, independent
    of E2E.
  - Verify: workflow review

- [x] **T-002** — Add an independent E2E workflow.
  - Files: `.github/workflows/e2e.yml`
  - Done when: it installs Chromium, runs all E2E scenarios, and uploads reports on
    completion without depending on lint/build.
  - Verify: workflow review

## Gates

- [x] **T-010** — `pnpm lint` passes
- [x] **T-011** — `pnpm build` passes
- [x] **T-012** — `pnpm test:e2e` passes
- [x] **T-013** — Both workflows have push, pull-request, and manual triggers
- [x] **T-014** — Unit testing is documented as deferred, not represented by a no-op job

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Add a unit-test workflow | No unit-test suite or runner exists yet | Add with the future unit-testing feature |
| Update required status checks | Branch protection is configured outside this repository | Update settings if the old combined check is required |
| Verify GitHub-hosted runs | Authenticated GitHub access is unavailable in this environment | Confirm both checks after pushing |
