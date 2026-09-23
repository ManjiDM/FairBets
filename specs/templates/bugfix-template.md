# Bugfix: [Short description of the defect]

| Field | Value |
| --- | --- |
| ID | `NNN-fix-slug` |
| Status | Reproducing \| Diagnosed \| Fixing \| Verified |
| Severity | Wrong money \| Data loss \| Broken flow \| Cosmetic |
| Created | YYYY-MM-DD |
| Related | Issue / PR links |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

What actually happens. Exact figures, exact messages, exact screen.

## Expected behaviour

What should happen instead, and the rule that says so. Cite the source of truth:
a function in `src/domain/`, a scenario in `features/`, or a principle in
[`../constitution.md`](../constitution.md).

> If the observed and expected values disagree, first establish **which side is wrong**.
> A failing test can mean broken code *or* a stale expectation. Do not change either
> until you know which.

## Reproduction

Minimal, deterministic steps. For money bugs, give the full input state.

```text
Settings: baseStake …, maxStake …, stakeRounding …, startingBalance …
Bets:     loss @ 2.00, open @ 3.00, win @ 1.80
Action:   …
Observed: …
Expected: …
```

## Arithmetic check

For any stake, sequence, or balance defect, show the calculation by hand so the correct
answer is not in doubt.

| Step | Formula | Value |
| --- | --- | --- |
| | | |

## Root cause

The actual defect, named precisely: file, function, and the faulty assumption. Not
"rounding was off" but "`fromMoneyUnits` truncated instead of rounding at the half-unit
boundary".

- **Introduced by:** commit / change, if identifiable
- **Why tests missed it:** the coverage gap that let this through

## Blast radius

- Which other calculations share this code path?
- Are any **already-persisted ledgers** holding incorrect values as a result?
- Does a stored-data correction or migration need to ship alongside the fix?
- Did any incorrect figure reach the cloud copy?

Answer "none" explicitly where nothing is affected.

## Regression scenario

The scenario that fails **before** the fix and passes after. This is the deliverable
that stops the bug returning.

```gherkin
Scenario: [Defect description, phrased as correct behaviour]
  Given [the exact reproduction state]
  When [the action]
  Then [the expected — not the buggy — outcome]
```

Where it lands:

- [ ] `e2e/features/*.feature` — automatable through the UI
- [ ] `features/*.feature` — behaviour of record
- [ ] Neither is possible; the manual check is described below and the reason given

## Fix

The intended change, in one or two sentences. Keep it minimal and targeted — a bugfix is
not a refactor. Anything larger that this defect reveals becomes its own spec.

## Constitution check

Confirm the fix does not trade one violation for another. See
[`../constitution.md`](../constitution.md).

- [ ] III. Domain logic stays pure and deterministic
- [ ] IV. No money math moved into the UI to make the fix easier
- [ ] V. Sequence model preserved
- [ ] VI. Risk limits still enforced
- [ ] VII. Existing saved ledgers still load and compute correctly

## Verification

- [ ] Regression scenario failed before the fix (evidence recorded below)
- [ ] Regression scenario passes after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

```text
Paste the failing output from before the fix.
```
