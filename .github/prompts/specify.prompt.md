---
mode: agent
description: "Stage 1 — turn a feature request into a FairBets spec"
---

# Specify

Create a new specification for: `${input:feature:Describe the feature or change}`

## Steps

1. Read [`../../specs/constitution.md`](../../specs/constitution.md) and
   [`../../specs/README.md`](../../specs/README.md).
2. Pick the next free number under `specs/` (`001`, `002`, ...) and a short kebab-case
   slug. Create `specs/<FG-NNN-slug>/`.
3. Copy `specs/templates/spec-template.md` to `specs/<FG-NNN-slug>/spec.md` and fill every
   section.
4. Read enough of the codebase to describe current behaviour accurately — `src/domain/ledger.ts`
   for money rules, `e2e/features/` for existing behaviour of record — but do **not** write
   implementation detail into the spec.

## Rules

- Describe **what** and **why**, never **how**. No file paths, function names, library
  choices, or code in the spec.
- Functional requirements are numbered, testable, and unambiguous.
- Include worked numeric examples for anything touching stakes or sequences.
- Acceptance scenarios are Gherkin and cover the happy path, at least one rejection
  path, and the edge cases listed in the template.
- Mark every assumption you cannot confirm as `[NEEDS CLARIFICATION: question]`. Do not
  guess on money rules, data shapes, or risk limits.
- Complete the constitution check. If the request conflicts with a principle, say so in
  the spec rather than quietly accommodating it.

## Output

Report the spec path, a summary of the requirements, and the list of open clarifications
that must be resolved before planning.
