# Tasks: [Feature name]

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | YYYY-MM-DD |

> Ordered, small, individually verifiable steps. Domain logic first, then UI, then
> scenarios, then docs. Tick each box as it lands. If the order turns out to be wrong,
> update this file rather than improvising silently.
>
> `[P]` marks tasks that can run in parallel because they touch different files.

## 1. Domain

- [ ] **T-001** — [What]
  - Files: `src/domain/ledger.ts`
  - Done when: [observable condition]
  - Verify: `pnpm build`

- [ ] **T-002** — [What]
  - Files: `src/domain/...`
  - Done when:
  - Verify:

## 2. Persistence and migration

- [ ] **T-010** — [Migration or schema step, or "not required"]
  - Files: `src/App.tsx`, `src/lib/cloudStore.ts`, `supabase/migrations/...`
  - Done when: existing saved ledgers still load unchanged
  - Verify: `pnpm build`, manual load of a legacy ledger

## 3. UI

- [ ] **T-020** — [What]
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: UI reads values from `src/domain/` only
  - Verify: `pnpm lint`, `pnpm dev` manual check

## 4. Scenarios

- [ ] **T-030** — Add scenarios
  - Files: `e2e/features/*.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: every acceptance scenario in the spec is represented and runs green
  - Verify: `pnpm test:e2e`

## 5. Documentation

- [ ] **T-040** [P] — Update `README.md` and any affected guidance
  - Files: `README.md`, `.github/copilot-instructions.md`
  - Done when: documented behaviour matches shipped behaviour
  - Verify: review

## 6. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes (or justified as not applicable)
- [ ] **T-053** — Each acceptance scenario in `spec.md` confirmed satisfied

## Deferred

Tasks consciously not done, each with a reason.

| Task | Reason | Follow-up |
| --- | --- | --- |
| | | |
