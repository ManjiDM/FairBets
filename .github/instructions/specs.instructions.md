---
applyTo: "specs/**"
---

# Spec authoring instructions

These files are the contract that code is written against. Treat them as the primary
artifact, not as documentation written after the fact.

## Rules

- `spec.md` describes **what** and **why**. No file paths, function names, library
  choices, or code.
- Bugfix specs use `bugfix-template.md` instead, and must record a reproduction, the
  root cause, and evidence that the regression scenario failed before the fix.
- `plan.md` describes **how**. It is written only after every `[NEEDS CLARIFICATION]`
  marker in the spec is resolved.
- `tasks.md` is ordered, small, and individually verifiable, with a "done when" and a
  verification step per task.
- Functional requirements are numbered `FR-n`, testable, and unambiguous.
- Anything touching stakes or sequences includes worked numeric examples.
- Acceptance scenarios are Gherkin and cover the happy path, a rejection path, and the
  edge cases in the template.
- Every spec completes the constitution check against
  [`constitution.md`](../../specs/constitution.md).
- Keep spec directories after shipping. They are the decision history.
- Never delete a `[NEEDS CLARIFICATION]` marker by guessing — answer it or ask.
- If implementation diverges from the plan, update `plan.md` and `tasks.md`. These files
  must always describe what was actually built.

## Naming

Use `specs/FB-NNN-feature-slug/`, where `FB-NNN` is one greater than the highest
zero-padded sequential FairBets work-item ID already in the spec directories. Check
existing spec directories before assigning it.
Bugfixes use the same sequence and include `fix-` in the slug. Put any GitHub issue
number in the spec's `Related` field; it does not replace the FairBets ID.

The first commit for a feature or bugfix is its draft spec, committed before clarification,
planning, or implementation as `spec(FB-NNN): define <feature-slug>`. Keep the slug short
enough to meet the 50-character commit-subject limit. Keep the same ID in the spec
metadata and every follow-up commit for the work item. If Git prevents the commit, stop
and report the blocker rather than continuing without it.

## Templates

`specs/templates/spec-template.md`, `plan-template.md`, `tasks-template.md`, and
`feature-template.feature`.
