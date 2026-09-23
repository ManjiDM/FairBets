---
mode: agent
description: "Stage 3 — turn a clarified spec into a technical plan"
---

# Plan

Produce the implementation plan for `specs/${input:spec:FG-NNN-feature-slug}/spec.md`.

## Preconditions

- The spec exists and contains no `[NEEDS CLARIFICATION]` markers. If any remain, stop
  and run the clarify stage first.

## Steps

1. Read the spec and [`../../specs/constitution.md`](../../specs/constitution.md).
2. Read the code you intend to change — at minimum `src/domain/ledger.ts` for money
   rules, plus `src/App.tsx`, `src/domain/workbookImport.ts`, or `src/lib/cloudStore.ts`
   as relevant.
3. Copy `specs/templates/plan-template.md` to `specs/<FG-NNN-slug>/plan.md` and complete
   every section.

## Rules

- Put all stake and sequence math in `src/domain/` as pure, deterministic functions.
  The UI never calculates.
- State the exact signatures of new or changed domain exports and the invariants they
  hold.
- Spell out data impact: `LedgerState` shape, `localStorage` migration, cloud schema
  changes. A cloud change means `supabase/schema.sql` + a new `supabase/migrations/`
  file + `src/lib/cloudStore.ts` parsers, together.
- Name one rejected alternative and why it lost.
- Fill in the risk table honestly, including data-loss risk.
- Complete the constitution check with reasoning, not just ticks.

## Output

Report the plan path, the affected modules, the migration decision, and the top risk.
