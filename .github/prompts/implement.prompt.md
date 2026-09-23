---
mode: agent
description: "Stage 5 — execute a task list against the codebase"
---

# Implement

Execute `specs/${input:spec:NNN-feature-slug}/tasks.md`.

## Preconditions

- `spec.md`, `plan.md`, and `tasks.md` exist and are current.

## Steps

1. Read all three documents before touching code.
2. Work tasks in order. After each one, tick its checkbox in `tasks.md`.
3. Run the task's verification step before moving on.
4. When everything is done, run the gate tasks.

## Rules

- Implement only what the spec requires. Anything new you think of goes into the spec's
  "Out of scope for now" section, not into the code.
- Stake and sequence math goes in `src/domain/` as pure deterministic functions; UI code
  consumes them and never recalculates.
- Keep `LedgerState` as `{ ledgerName, settings, bets }`. Preserve `localStorage`
  migrations for existing users.
- Respect `maxStake` and `maxOpenExposure` as hard limits in every new code path.
- Cloud shape changes update `supabase/schema.sql`, a new `supabase/migrations/` file,
  and `src/lib/cloudStore.ts` parsers together.
- Never commit secrets. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are
  browser-safe.
- If the plan turns out to be wrong, stop, update `plan.md` and `tasks.md`, then
  continue. The spec directory must always describe what was actually built.
- Commit iteratively with a single-line message and no commit body. Do not push and do
  not open a pull request unless explicitly asked.

## Output

Report which tasks landed, which were deferred and why, the gate results, and any
divergence written back into the plan.
