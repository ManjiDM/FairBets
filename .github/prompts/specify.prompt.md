---
mode: agent
description: "Stage 1 — turn a feature request into a FairBets spec"
---

# Specify

Create a new specification for: `${input:feature:Describe the feature or change}`

## Steps

1. Read [`../../specs/constitution.md`](../../specs/constitution.md) and
   [`../../specs/README.md`](../../specs/README.md).
2. Inspect existing `specs/FB-*` directories and reserve one greater than the highest
   sequential ID (`FB-001`, `FB-002`, ...). Do not use a GitHub issue number for this
   sequence or reuse an ID. Create `specs/FB-NNN-<feature-slug>/`.
3. Copy `specs/templates/spec-template.md` to
   `specs/FB-NNN-<feature-slug>/spec.md`, set its ID field to the same canonical
   `FB-NNN-<feature-slug>`, and fill every section. Keep open decisions marked for
   clarification.
4. Read enough of the codebase to describe current behaviour accurately — `src/domain/ledger.ts`
   for money rules, `e2e/features/` for existing behaviour of record — but do **not** write
   implementation detail into the spec.
5. Commit only this draft spec before asking clarifications, creating a plan or task list,
   or changing implementation code. The commit format is
   `spec(FB-NNN): define <feature-slug>`; choose a short slug that fits the commit hook's
   50-character subject limit, use the reserved ID, and include the slug in the subject.
   Continue using that same `FB-NNN` for every later commit in this change. If the commit
   is blocked by a hook or Git configuration, stop and report the blocker.

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

Report the reserved ID and spec path, a summary of the requirements, open clarifications,
and the draft-spec commit hash.
