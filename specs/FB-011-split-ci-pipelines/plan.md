# Plan: Split CI pipelines by purpose

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Done |
| Updated | 2026-10-02 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Keep the existing CI workflow as the lint/build pipeline and remove its E2E browser
installation, scenario execution, and report-upload steps. Add a dedicated E2E workflow
that installs dependencies and Chromium, then runs the existing `pnpm test:e2e` command
and uploads its reports.

Both workflows retain push-to-main, pull-request, and manual triggers, use the same
least-privilege read permission for repository contents, and use separate concurrency
groups so cancellations in one do not affect the other. The Pages deployment workflow
is unchanged.

Unit testing is not represented by an empty or placeholder workflow. Add that third
pipeline later alongside a real unit-test runner and tests. Existing branch protection
settings are outside repository workflow files and may need manual updates if they
require the old combined status name.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Retain lint and build steps only | Existing push, PR, and dispatch triggers |
| `.github/workflows/e2e.yml` | Add independent browser E2E pipeline | Preserves Playwright setup and report artifact |
| `specs/FB-011-split-ci-pipelines/*` | Track specification, plan, tasks, and verification | |

## Workflow changes

### Lint and build

- Checkout the source.
- Set up pnpm and Node.js using the repository's pinned versions.
- Install dependencies with the frozen lockfile.
- Run `pnpm lint`.
- Run `pnpm build`.
- Do not install Playwright or run E2E scenarios.

### End-to-end

- Checkout the source.
- Set up pnpm and Node.js using the repository's pinned versions.
- Install dependencies with the frozen lockfile.
- Install Chromium and required operating-system dependencies.
- Run `pnpm test:e2e`.
- Upload `dist/e2e/` reports on success or failure when present.
- Do not run lint or production build as a prerequisite.

## Test strategy

- Review both workflow trigger, permissions, runner, setup, and command lists.
- Review workflow YAML structure and triggers. No YAML/action linter is installed in the
  environment.
- Run local `pnpm lint`, `pnpm build`, and `pnpm test:e2e` to verify the commands
  themselves are unchanged and functional.
- GitHub-hosted workflow execution remains the final validation for actions and runner
  integration; authenticated GitHub access is unavailable in this environment.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Existing branch protection requires the former combined status check | Pull requests may remain blocked | Document that required checks may need to be updated to both new workflow/job checks |
| E2E assumes build output exists | Standalone E2E workflow could fail | Confirm the existing runner starts Vite and creates E2E reports without `dist` build output |
| Concurrency groups collide | One pipeline cancels another | Use purpose-specific concurrency groups |
| Unit tests are absent | A nominal unit pipeline would do no useful work | Defer that pipeline until tests and a runner exist |

## Constitution check

- I-VIII: No product, data, or domain behavior changes.
- IX: User-facing behavior does not change; this spec records operational workflow
  expectations in Gherkin.
- X: The existing lint/build/E2E commands remain required and independently visible.

## Rollback

Restore the previous combined CI workflow and remove the E2E workflow. No application
code, data, or deployment configuration needs migration.
