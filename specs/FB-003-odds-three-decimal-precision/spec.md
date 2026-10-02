# Bugfix: Accept odds with three decimal places

| Field | Value |
| --- | --- |
| ID | `FB-003-odds-three-decimal-precision` |
| Status | Reproducing |
| Severity | Broken flow |
| Created | 2026-10-02 |
| Related | — |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

The user reports that the app restricts decimal odds to two decimal places, preventing
them from entering odds such as `1.234`.

This report has not yet been independently reproduced. The exact form response
(rejection, truncation, or rounding) and affected entry surfaces remain to be confirmed.

## Expected behaviour

The user must be able to enter and save decimal odds with three fractional digits, such
as `1.234`, without the value being rounded or truncated to two digits. Existing odds
with two or fewer fractional digits must continue to work.

The requested precision is a product requirement. No existing constitution principle
sets a two-decimal limit for odds; the app should preserve an odds value consistently
through the affected input, calculation, persistence, and display paths.

## Reproduction

User-reported reproduction; exact interaction details are pending confirmation.

```text
Settings: not relevant to the reported input restriction
Bets:     none required
Action:   open the bet-entry form and enter decimal odds 1.234
Observed: the app appears to restrict odds to two decimal places
Expected: 1.234 can be entered and saved without rounding or truncation
```

## Arithmetic check

Not applicable. This defect concerns odds precision, not a reported stake, sequence, or
balance calculation. The implementation must nevertheless preserve the entered odds
when calculating any derived values.

## Root cause

Not yet diagnosed. Inspect the input constraints, validation, formatting, domain odds
precision, and persistence/import paths after committing this reproduction spec.

- **Introduced by:** Unknown
- **Why tests missed it:** Existing coverage uses odds with two decimal places; a
  regression scenario for three-decimal odds is not yet present.

## Blast radius

- The manual bet-entry form is the reported surface; edit, workbook import, cloud restore,
  display formatting, and ledger calculations need inspection.
- No incorrect persisted data is reported. Determine whether previously entered odds can
  have been rounded or truncated.
- No cloud impact is known; check whether its numeric representation preserves three
  fractional digits.
- No stored-data migration is expected unless investigation finds previously lost
  precision that can be recovered.

## Regression scenario

This scenario captures the reported behaviour. It must be run and confirmed failing
before the fix; record the exact red output below.

```gherkin
Scenario: Save odds with three decimal places
  Given the user is entering a bet
  When the user enters decimal odds "1.234"
  And saves the bet
  Then the bet should retain odds "1.234"
  And the odds should not be rounded or truncated to two decimal places
```

Where it lands:

- [x] `e2e/features/*.feature` — automatable through the UI
- [ ] Not automatable; the manual check is described below and the reason given

## Fix

Pending diagnosis. Make the smallest change that accepts and preserves three fractional
digits for the confirmed affected surfaces, without changing the meaning of existing
two-decimal odds.

## Constitution check

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
Not yet independently reproduced. Capture the failing scenario output before changing
the implementation.
```
