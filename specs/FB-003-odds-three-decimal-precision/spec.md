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
them from entering odds such as `1.234`. Source inspection confirms the manual field uses
`step="0.01"` and all rendered odds are formatted with exactly two decimal places.

The exact browser response (rejection, truncation, or rounding) has not yet been
independently reproduced. Existing paths also need regression coverage to ensure imported
or cloud-restored odds retain their precision.

## Expected behaviour

The user must be able to enter and save decimal odds with up to three fractional digits,
such as `1.234`, without the value being rounded or truncated to two digits. Odds
precision must be retained when loading a workbook or restoring a cloud backup.
Previously saved odds with two or fewer fractional digits must continue to work.

The requested precision is a product requirement. No existing constitution principle
sets a two-decimal limit for odds; the app should preserve an odds value consistently
through the affected input, calculation, persistence, and display paths.

## Reproduction

User-reported reproduction; a failing automated scenario still needs to confirm the
browser's exact response.

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

Source inspection identifies two causes: the manual decimal-odds input uses
`step="0.01"`, which makes three-decimal values fail the browser's native step
constraint, and `formatOdds` uses `toFixed(2)`, hiding any additional precision in the
bet list and next-odds guide. The domain calculation and cloud `odds` column both use
four-decimal precision; the workbook importer parses odds as numbers.

- **Introduced by:** Existing two-decimal input and display assumptions
- **Why tests missed it:** Existing UI scenarios use odds with two decimal places and do
  not assert the rendered odds value.

## Blast radius

- Manual bet entry and editing are in scope. The workbook importer and cloud restore are
  also in scope for preserving up to three fractional digits.
- The ledger calculation uses four-decimal odds units, so three-decimal values fit without
  a calculation-scale migration.
- The workbook importer parses odds numerically, and the cloud column is `numeric(12, 4)`;
  verify with regression coverage that each path preserves the value.
- No incorrect persisted data is reported. Existing values are not migrated; precision
  already lost before this fix cannot be recovered.

## Regression scenario

This scenario captures the reported behaviour. It must be run and confirmed failing
before the fix; record the exact red output below. Add coverage that imported and restored
values retain their odds precision.

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

## Clarified decisions

| Question | Decision |
| --- | --- |
| What precision should manual odds support? | Up to three fractional digits |
| Which surfaces are in scope? | Manual entry and editing, workbook import, and cloud restore |
