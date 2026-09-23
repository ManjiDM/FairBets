---
mode: agent
description: "Stage 2 — resolve open questions in a spec before planning"
---

# Clarify

Resolve the open questions in `specs/${input:spec:FG-NNN-feature-slug}/spec.md`.

## Steps

1. Read the spec and collect every `[NEEDS CLARIFICATION: ...]` marker.
2. Rank them by impact. Anything affecting money rules, persisted data shapes, or risk
   limits comes first.
3. Ask the user, one focused batch at a time, offering a concrete recommended default
   for each question so answering is cheap.
4. Write each answer into the relevant spec section and delete the marker.
5. Re-check the acceptance scenarios: an answer usually changes or adds one.

## Rules

- Never resolve a money, data-shape, or risk-limit question by guessing.
- Questions you can answer yourself from the codebase are not clarifications — answer
  them from `src/domain/ledger.ts`, `src/lib/cloudStore.ts`, or `features/` and record
  the finding.
- The spec must contain zero markers before planning starts.
- If an answer contradicts [`../../specs/constitution.md`](../../specs/constitution.md),
  raise it explicitly instead of proceeding.

## Output

List each question, the answer applied, and confirm the spec now has no remaining
`[NEEDS CLARIFICATION]` markers.
