# Spec: Split CI pipelines by purpose

| Field | Value |
| --- | --- |
| ID | `FB-011-split-ci-pipelines` |
| Status | Shipped |
| Created | 2026-10-02 |
| Related | — |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

The current CI combines linting, production build, and browser end-to-end scenarios in
one pipeline. A failure in any one purpose blocks visibility into which other checks
would pass, and the E2E browser setup makes simple code-quality feedback wait longer.

## Goal

Run end-to-end scenarios independently from lint/build checks, so each pipeline reports
its own result and can be understood and acted on separately.

## Non-goals

- Adding a unit-test framework or unit tests. The project does not currently have them;
  unit testing can be introduced in a later change.
- Changing the checks themselves, their commands, or their acceptance criteria.
- Changing GitHub Pages deployment behavior.
- Changing repository branch protection or required status checks.

## Users and scenarios

**Primary user:** A contributor reviewing a pull request or a CI run.

The contributor can identify whether a change failed lint/build or E2E without waiting
for those purposes to run as one sequence. Each workflow remains independently visible
and can be manually dispatched.

## Functional requirements

- **FR-1** The lint/build pipeline MUST run lint and production build checks.
- **FR-2** The E2E pipeline MUST install its required browser and run the existing E2E
  scenarios.
- **FR-3** Both pipelines MUST run on pushes to `main`, pull requests, and manual
  dispatch.
- **FR-4** Either pipeline's result MUST NOT depend on the other pipeline succeeding.
- **FR-5** Existing GitHub Pages deployment behavior MUST remain unchanged.
- **FR-6** Unit-test infrastructure and execution are explicitly deferred.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Push to `main` | Lint/build and E2E workflows both start independently | Deployment remains its own workflow |
| Pull request | Lint/build and E2E workflows both start independently | Distinct status results |
| Manual dispatch | Each workflow can be started independently | No cross-workflow dependency |
| Unit tests requested | No unit-test workflow runs in this change | No current unit test suite |

## Acceptance scenarios

```gherkin
Scenario: Run code quality checks independently
  Given a push to main or a pull request
  When CI starts
  Then a lint and build pipeline should run lint and the production build
  And that pipeline should not wait for E2E
```

```gherkin
Scenario: Run end-to-end tests independently
  Given a push to main or a pull request
  When CI starts
  Then an E2E pipeline should install the browser and run all current scenarios
  And that pipeline should not wait for lint or build
```

```gherkin
Scenario: Dispatch either pipeline manually
  Given a contributor manually dispatches one CI workflow
  When the workflow starts
  Then only that workflow's checks should be required for its result
```

## Edge cases

- One pipeline fails while the other is still running or succeeds.
- A workflow is manually dispatched.
- A pull request updates multiple times while prior runs are active.
- Unit-test scripts do not yet exist.
- The deployment workflow continues to build and deploy independently on `main`.

## Data impact

None. No application data, local storage, cloud schema, or workbook layout changes.

## Constitution check

Confirm against [`../constitution.md`](../constitution.md), noting anything that needs
discussion.

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain stay separated
- [x] V. The sequence model is preserved
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [x] X. Gates pass

## Open questions

None. Unit tests are deferred until a unit-test suite exists.

## Out of scope for now

Adding Vitest or another test runner, creating unit tests, or changing branch
protection's required check names.
