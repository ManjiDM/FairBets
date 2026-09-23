# FairBets constitution

The non-negotiable principles for this project. Specs, plans, and implementations are
checked against this document. A change that violates a principle is rejected or the
principle is amended first — never silently bypassed.

Amendments: edit this file in its own commit, state the rationale in the PR description,
and bump the version below.

**Version:** 1.0.0 · **Ratified:** 2026-09-23

---

## I. Private tracker, never an operator

FairBets records bets a person has already decided to place. It must never place bets,
integrate with a bookmaker's betting API, or present output as a prediction of outcomes.
Language in UI, docs, and specs stays descriptive ("recorded", "suggested stake"), never
promissory ("guaranteed", "sure win", "profit system").

## II. Local-first

The browser is the primary store. The app must remain fully functional with no network
and no Supabase configuration. Cloud storage is backup, restore, and sync — never a
requirement for core use. No feature may make the app unusable when offline.

## III. Deterministic domain logic

All stake and sequence math lives in `src/domain/` as small, pure, deterministic
functions of their inputs. No randomness, no wall-clock reads, no I/O, no React imports
inside domain modules. The same `LedgerState` must always produce the same computed
result, so any figure shown to a user can be audited and reproduced.

## IV. UI and domain stay separated

`src/App.tsx` and other UI code render state and collect input. They never compute stake
or sequence values inline. If a calculation is needed in the UI, it is exported from
`src/domain/`.

## V. The sequence model is sacred

- A sequence begins at `baseStake`.
- Losses and open outcomes continue the sequence.
- The next win closes the sequence; the following bet starts a fresh one at `baseStake`.
- Open bets are **exposure**. They are never counted as settled losses, and never hidden.

Any change to this model requires an explicit spec section justifying it and updated
acceptance scenarios.

## VI. Risk limits are enforced, not advisory

`maxStake` and `maxOpenExposure` are hard ceilings for suggested and manually entered
stakes. Validation rejects violations; the dashboard warns when limits are approached or
exceeded. No code path may silently exceed a configured limit.

## VII. Data compatibility is preserved

Persisted data is a contract:

- `localStorage` shapes are migrated forward, never dropped. Legacy keys keep working.
- Cloud schema changes ship as `supabase/schema.sql` + a new `supabase/migrations/` file
  + updated parsers in `src/lib/cloudStore.ts`, in the same change.
- The workbook importer keeps accepting the documented `DATETIME` and `ODD`/`ODDS`
  layout.

## VIII. Secrets never enter the repository

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-safe. Service-role
keys, tokens, and personal ledger exports are never committed, never placed in
`.env.local` examples, and never printed in logs. Row-level security is mandatory for
every cloud table.

## IX. Behaviour is specified in Gherkin

User-visible behaviour is described as Gherkin scenarios before implementation:
product-level intent in `features/`, executable coverage in `e2e/features/` with
Playwright-backed steps in `e2e/steps/`. A UI behaviour change without a scenario is
incomplete.

## X. Every change is gated

`pnpm lint` and `pnpm build` must pass. `pnpm test:e2e` must pass when UI behaviour
changed. Green gates are a precondition for "done", not a follow-up task.
