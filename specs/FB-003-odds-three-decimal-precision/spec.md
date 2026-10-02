# Bugfix: Accept odds with three decimal places

| Field | Value |
| --- | --- |
| ID | `FB-003-odds-three-decimal-precision` |
| Status | Verified |
| Severity | Broken flow |
| Created | 2026-10-02 |
| Related | — |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

The app restricted manual decimal odds to two decimal places, preventing values such as
`1.234` from being submitted. Source inspection confirmed the field used `step="0.01"`
and all rendered odds were formatted with exactly two decimal places.

The regression scenario reproduced the defect: the browser prevented submission of a bet
with odds `1.234`, so the bet was not added to the ledger. Regression coverage now confirms
that manually entered and workbook-imported odds retain their precision.

## Expected behaviour

The user must be able to enter and save decimal odds with up to three fractional digits,
such as `1.234`, without the value being rounded or truncated to two digits. Odds
precision must be retained when loading a workbook or restoring a cloud backup.
Previously saved odds with two or fewer fractional digits must continue to work.

The requested precision is a product requirement. No existing constitution principle
sets a two-decimal limit for odds; the app should preserve an odds value consistently
through the affected input, calculation, persistence, and display paths.

## Reproduction

Reproduced by the E2E scenario before the fix:

```text
Settings: not relevant to the reported input restriction
Bets:     none required
Action:   open the bet-entry form and enter decimal odds 1.234
Observed: browser validation blocks submission; the bet does not appear in the ledger
Expected: 1.234 can be entered and saved without rounding or truncation
```

## Arithmetic check

Not applicable. This defect concerns odds precision, not a reported stake, sequence, or
balance calculation. The implementation must nevertheless preserve the entered odds
when calculating any derived values.

## Root cause

The manual decimal-odds input uses `step="0.01"`, so `1.234` fails the browser's native
step constraint and form submission is blocked. Separately, `formatOdds` uses
`toFixed(2)`, which would hide additional precision in the bet list and next-odds guide
even if the value were saved. The domain calculation and cloud `odds` column both use
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
  workbook import is covered by E2E. Cloud restore passes the parsed numeric value
  directly into ledger state; a live backup restore remains a manual check.
- No incorrect persisted data is reported. Existing values are not migrated; precision
  already lost before this fix cannot be recovered.

## Regression scenario

This scenario failed before the fix and now passes. The E2E scenario also verifies that
the value survives a reload and an edit. Workbook import has an executable regression
scenario as well. Cloud restore cannot be exercised in the local E2E suite without a
configured Supabase project, so retain the manual scenario below.

```gherkin
Scenario: Save odds with three decimal places
  Given the user is entering a bet
  When the user enters decimal odds "1.234"
  And saves the bet
  Then the bet should retain odds "1.234"
  And the odds should not be rounded or truncated to two decimal places
```

```gherkin
Scenario: Restore odds with three decimal places from cloud backup
  Given a cloud backup contains a bet with odds "1.234"
  When the user restores that backup
  Then the bet should retain and display odds "1.234"
```

Where it lands:

- [x] `e2e/features/*.feature` — automatable through the UI
- [x] Not automatable; the live cloud restore check is described below because E2E has no
      configured Supabase project

## Fix

Set the decimal-odds input step to `0.001` and format odds with at least two and up to
four fractional digits. The existing calculation, workbook parser, and cloud numeric
column already preserve the requested precision, so no domain change or data migration is
needed.

## Constitution check

- [x] III. Domain logic stays pure and deterministic — odds calculation precision was
      already sufficient; domain logic is unchanged
- [x] IV. No money math moved into the UI to make the fix easier
- [x] V. Sequence model preserved — sequence calculations are unchanged
- [x] VI. Risk limits still enforced — stake and exposure validation are unchanged
- [x] VII. Existing saved ledgers still load and compute correctly — no persisted shape
      or migration changed; the E2E suite still loads the existing demo ledger

## Verification

- [x] Regression scenario failed before the fix (evidence recorded below)
- [x] Regression scenario passes after the fix, including add, edit, and reload
- [x] `pnpm lint` — pass
- [x] `pnpm build` — pass
- [x] `pnpm test:e2e` — pass, 22 scenarios and 164 steps
- [x] Existing demo ledger and saved odds still load; no data migration was introduced
- [ ] Live cloud-backup restore with odds `1.234` (deferred: no Supabase project is
      configured for this E2E run)

**Evidence of the red state:**

```text
pnpm test:e2e
Scenario: Save and display odds with three decimal places
Expected substring: "1.234 odds"
Error: element(s) not found
22 scenarios (1 failed, 21 passed)
157 steps (1 failed, 156 passed)
```

## Clarified decisions

| Question | Decision |
| --- | --- |
| What precision should manual odds support? | Up to three fractional digits |
| Which surfaces are in scope? | Manual entry and editing, workbook import, and cloud restore |

## Manual check

When a Supabase project is available, restore a backup containing a bet with odds
`1.234` and confirm the bet remains visible as `1.234 odds`. Cloud restore is not
configured in the local E2E environment; the parser and `numeric(12, 4)` schema were
checked in source. This live integration check remains unverified.
