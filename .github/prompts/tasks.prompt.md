---
mode: agent
description: "Stage 4 — break a plan into ordered, verifiable tasks"
---

# Tasks

Generate the task list for `specs/${input:spec:NNN-feature-slug}/plan.md`.

## Preconditions

- `spec.md` and `plan.md` exist and are current.

## Steps

1. Read the spec and the plan.
2. Copy `specs/templates/tasks-template.md` to `specs/<NNN-slug>/tasks.md`.
3. Derive tasks directly from the plan's affected-modules table and test strategy.

## Rules

- Order: domain → persistence/migration → UI → Gherkin scenarios → docs → gates.
- Each task names the files it touches, a "done when" condition, and a verification
  command or check.
- Keep tasks small enough to land and verify independently. Split anything that touches
  both domain and UI.
- Mark tasks `[P]` only when they touch disjoint files.
- Every acceptance scenario in the spec must map to at least one task.
- Always include the gate tasks: `pnpm lint`, `pnpm build`, `pnpm test:e2e` (or a stated
  reason it does not apply), and confirmation of each acceptance scenario.

## Output

Report the task file path, the task count, and the intended execution order.
