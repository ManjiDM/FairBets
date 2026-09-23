---
mode: agent
description: "Stage 6 — verify an implementation against its spec"
---

# Verify

Verify the implementation of `specs/${input:spec:FG-NNN-feature-slug}/spec.md`.

## Steps

1. Run the gates:

   ```bash
   pnpm lint
   pnpm build
   pnpm test:e2e
   ```

   `pnpm exec playwright install chromium` is needed once before the first E2E run.

2. Walk every acceptance scenario in `spec.md` and confirm the implemented behaviour
   matches, including the worked numeric examples in the business-rules table.
3. Check each functional requirement (`FR-n`) is satisfied and each non-goal is
   respected.
4. Re-run the constitution check against the code as built, not as planned.
5. Confirm `tasks.md` has no unticked, unexplained tasks.
6. Confirm the persisted-data path: an existing saved ledger from before the change
   still loads and computes correctly.

## Rules

- Do not mark verified on the basis of reading code alone where a command can prove it.
- A failing gate is a blocker, not a follow-up item.
- Report honestly. An unverified scenario is reported as unverified.

## Output

A table of requirement / scenario → pass, fail, or not verified with the reason; the
gate results; and a clear statement of whether the feature is done.
