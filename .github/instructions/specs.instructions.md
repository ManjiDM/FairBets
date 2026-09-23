---
applyTo: "specs/**"
---

# Spec authoring instructions

These files are the contract that code is written against. Treat them as the primary
artifact, not as documentation written after the fact.

## Rules

- `spec.md` describes **what** and **why**. No file paths, function names, library
  choices, or code.
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

`specs/NNN-feature-slug/` with a zero-padded incrementing number and a short kebab-case
slug, for example `001-stake-rounding-modes`.

## Templates

`specs/templates/spec-template.md`, `plan-template.md`, `tasks-template.md`, and
`feature-template.feature`.
