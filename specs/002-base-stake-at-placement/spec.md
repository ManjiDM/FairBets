# Spec: Base stake applies from the moment a bet is placed

| Field | Value |
| --- | --- |
| ID | `002-base-stake-at-placement` |
| Status | Draft |
| Created | 2026-09-24 |
| Related | — |

## Problem

The base stake is a **live setting**, and every figure in the ledger is recalculated from
its current value. Changing it rewrites history.

A person who has been tracking at a base stake of €1.00 and decides to move up to €2.00
does not just change what happens next. The moment they save, every bet they have ever
placed — settled wins, settled losses, and bets still open — is re-priced as though it
had always been staked at €2.00. Recorded stakes double, sequence profit changes, the
recovery gap changes, the settled balance changes, and the available balance changes.

This is wrong twice over:

1. **It is factually false.** Those bets were placed at the old base stake. That is what
   was risked and that is what was won or lost. The ledger is a record of what happened,
   not a projection of what would have happened under today's settings.
2. **It destroys auditability.** A person cannot reconcile the app against their
   bookmaker account, because the app's history silently changed underneath them.

The same is true of a bet that is still **open**. It has been placed. The money is
already committed at the stake it was placed with.

## Goal

The base stake in effect when a bet was placed is the base stake that bet keeps for the
rest of its life. Changing the base stake affects only bets placed from that point on.

## Non-goals

- No change to the stake formula itself. The way a stake is derived from base stake,
  recovery gap, odds, threshold, and recovery weight is unchanged.
- No change to the sequence model. A sequence still starts on the bet after a win and
  closes on the next win.
- No settings history UI, no "as at date" reporting, no way to view the ledger under a
  hypothetical base stake.
- No retroactive editing tool for correcting the base stake recorded against a past bet.
  [NEEDS CLARIFICATION: is manual correction needed for a mis-recorded historical bet, or
  is deleting and re-adding the bet acceptable?]

## Users and scenarios

**Primary user:** a person tracking their own betting sequences, whose bankroll has grown
enough that they want to raise their base stake.

They have six months of history at €1.00. They open settings, change the base stake to
€2.00, and save. They expect the next bet they record to be suggested at the new, larger
stake. They expect their existing records — and their balance — to be exactly as they
were before they opened settings.

Today they instead find that their settled profit and available balance have both moved,
and none of their recorded stakes match their bookmaker history any more.

## Functional requirements

- **FR-1** Each bet MUST carry the base stake that was in effect at the moment it was
  recorded.
- **FR-2** Changing the base stake setting MUST NOT change any figure derived from a bet
  that was already recorded — its stake, its profit, its expected profit, its
  contribution to the sequence recovery gap, or its contribution to the settled balance.
- **FR-3** Changing the base stake setting MUST apply to every bet recorded after the
  change.
- **FR-4** A bet whose outcome is still **open** MUST be treated as already placed, and
  MUST keep the base stake it was recorded with.
- **FR-5** Settled balance, available balance, settled profit, expected profit, total
  staked, largest stake, goal progress, and win rate MUST all be identical before and
  after a base stake change, for a ledger with no new bets.
- **FR-6** The next-stake suggestion shown for the *upcoming* bet MUST use the new base
  stake immediately after the change.
- **FR-7** A sequence that is active when the base stake changes MUST remain a single
  sequence. Its earlier bets keep the old base stake and its later bets use the new one.
- **FR-8** Existing saved ledgers MUST continue to load, and MUST NOT show different
  figures after upgrading to this version.
  [NEEDS CLARIFICATION: existing bets have no recorded base stake. Should they be stamped
  with the base stake currently saved in settings — which freezes today's figures exactly
  as they appear — or is a different treatment expected?]
- **FR-9** Bets restored from a cloud backup MUST keep the base stake they were recorded
  with.
- **FR-10** Bets created by a workbook import MUST carry a base stake.
  [NEEDS CLARIFICATION: which base stake applies to imported bets — the current setting
  for all of them, or a value read from the workbook if one is present?]
- **FR-11** Editing an existing bet MUST NOT change the base stake recorded against it.
  [NEEDS CLARIFICATION: confirm. If a bet's date is edited to a much earlier time, should
  it still keep the base stake it was first recorded with?]
- **FR-12** The base stake recorded against a bet
  [NEEDS CLARIFICATION: must it be visible to the user anywhere — for example on the bet
  row or in the bet detail — or is it an internal record only?]

## Business rules

Only the **base stake** is pinned to the bet.

[NEEDS CLARIFICATION: the stake formula also reads threshold, recovery weight, stake
rounding, and maximum stake. Changing any of those today also rewrites history. Should
this change pin only the base stake, or the whole set of strategy settings that affect a
recorded stake?]

### Worked example

Settings: base stake **€1.00**, threshold €0.50, recovery weight 0.5, rounding 2
decimals, maximum stake €15.00, starting balance €50.00.

| # | Odds | Outcome | Base stake in effect | Stake | Profit |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.00 | lost | €1.00 | €1.00 | −€1.00 |
| 2 | 2.00 | won | €1.00 | €2.00 | +€2.00 |

After bet 1 the sequence is behind: expected €1.00 against profit −€1.00, a recovery gap
of €2.00. Bet 2 needs €2.00 of recovery at odds 2.00, which is weighted by 0.5 to €1.00
and added to the €1.00 base, giving a €2.00 stake. The win closes the sequence with
€1.00 of profit. Settled balance €51.00.

The user now changes the base stake to **€2.00**.

| | Today | Required |
| --- | --- | --- |
| Bet 1 stake | €2.00 | €1.00 |
| Bet 1 profit | −€2.00 | −€1.00 |
| Bet 2 stake | €4.00 | €2.00 |
| Bet 2 profit | +€4.00 | +€2.00 |
| Sequence profit | €2.00 | €1.00 |
| Settled balance | €52.00 | €51.00 |

A third bet recorded after the change, at odds 2.00 with a fresh sequence, is suggested
at **€2.00** — the new base stake — under both the current and the required behaviour.

### Mixed sequence

Settings start at base stake €1.00.

| # | Odds | Outcome | Base stake in effect |
| --- | --- | --- | --- |
| 1 | 2.00 | lost | €1.00 |
| — | — | *user changes base stake to €2.00* | — |
| 2 | 2.00 | lost | €2.00 |
| 3 | 2.00 | won | €2.00 |

Bet 1 keeps its €1.00 base. Bets 2 and 3 use €2.00. All three remain in the same
sequence, and the sequence closes on bet 3.

## Acceptance scenarios

```gherkin
Scenario: Raising the base stake leaves settled history untouched
  Given a ledger with settled bets recorded at a base stake of "1.00"
  And the available balance is shown
  When the user changes the base stake to "2.00" and saves
  Then the available balance should be unchanged
  And the settled profit should be unchanged
  And every recorded stake should be unchanged
```

```gherkin
Scenario: Raising the base stake leaves an open bet untouched
  Given a ledger with an open bet recorded at a base stake of "1.00"
  When the user changes the base stake to "2.00" and saves
  Then the stake of that open bet should be unchanged
  And the open exposure should be unchanged
```

```gherkin
Scenario: The new base stake applies to the next bet
  Given a ledger whose sequences are all closed
  When the user changes the base stake to "2.00" and saves
  And the user records a new bet at odds "2.00"
  Then the new bet should be staked at "2.00"
```

```gherkin
Scenario: A sequence that spans a base stake change stays one sequence
  Given an active sequence containing a losing bet recorded at a base stake of "1.00"
  When the user changes the base stake to "2.00" and saves
  And the user records another losing bet in that sequence
  Then both bets should belong to the same sequence
  And the first bet should keep its original stake
  And the second bet should be priced from the new base stake
```

```gherkin
Scenario: Lowering the base stake does not rewrite history either
  Given a ledger with settled bets recorded at a base stake of "2.00"
  When the user changes the base stake to "0.50" and saves
  Then the settled balance should be unchanged
```

```gherkin
Scenario: An existing saved ledger shows the same figures after upgrading
  Given a ledger saved by the previous version of the app
  When the app loads that ledger
  Then every figure should match what the previous version showed
```

## Edge cases

- **Zero bets.** Changing the base stake has nothing to re-price; the next-bet suggestion
  reflects the new value.
- **A single open bet.** Its stake is frozen; open exposure does not move.
- **An all-open sequence.** No settled profit exists, so the recovery gap stays zero and
  no figure moves.
- **A manual stake override.** The recorded stake already ignores the base stake, but the
  bet's expected profit is still derived from the base stake, so it must be pinned too.
- **Exactly at `maxStake`.** A bet already capped at the maximum stake keeps its capped
  stake; raising the base stake later does not un-cap or re-cap it.
- **Guardrail warnings.** A warning that a recorded stake exceeds the maximum stake is
  evaluated against the current limit, not a historical one — lowering the maximum stake
  must still surface historical breaches.
- **Existing saved data.** Covered by FR-8.
- **No network, no Supabase.** Entirely a local concern; the app must work offline as
  before.

## Data impact

- **`LedgerState` shape:** changes. Each bet gains a recorded base stake.
- **`localStorage` migration:** needed. Existing saved bets have no recorded base stake
  and must be given one on load, without changing any displayed figure.
- **Cloud schema:** a change is needed so the recorded base stake survives backup and
  restore. Older cloud rows will not have it.
  [NEEDS CLARIFICATION: how should a cloud row saved by the previous version be treated
  on restore — stamped with the base stake stored alongside it in that backup's settings?]
- **Workbook import:** the import layout itself does not change. Imported bets still need
  a base stake; see FR-10.

## Constitution check

- [x] I. Private tracker, never an operator — no change to what the app claims or does
- [x] II. Local-first — no new network dependency
- [x] III. Deterministic domain logic — calculations stay pure; they simply read the base
      stake from the bet rather than from live settings
- [x] IV. UI and domain stay separated — the rule belongs in the domain layer
- [x] V. The sequence model is preserved — FR-7 keeps sequences intact across a change
- [x] VI. Risk limits stay enforced — limits continue to be evaluated against current
      settings, as noted in the edge cases
- [ ] VII. Data compatibility preserved — **needs attention.** This changes the persisted
      shape and the cloud schema. FR-8 and FR-9 exist to hold the line: old ledgers must
      load and must not shift by a single cent
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin — acceptance scenarios above
- [x] X. Gates pass — enforced at verification

This change **strengthens** principle III's spirit: today a pure function produces a
different answer for the same historical bet depending on a setting changed months later.

## Open questions

- [NEEDS CLARIFICATION: should only the base stake be pinned, or every strategy setting
  that affects a recorded stake — threshold, recovery weight, rounding, maximum stake?]
- [NEEDS CLARIFICATION: how should existing saved bets be stamped so that no figure moves
  on upgrade?]
- [NEEDS CLARIFICATION: how should cloud rows saved by the previous version be treated on
  restore?]
- [NEEDS CLARIFICATION: which base stake applies to bets created by a workbook import?]
- [NEEDS CLARIFICATION: does editing an existing bet ever change its recorded base stake?]
- [NEEDS CLARIFICATION: should the recorded base stake be visible in the UI?]
- [NEEDS CLARIFICATION: is a way to correct a mis-recorded historical base stake needed?]

## Out of scope for now

- A full settings-history log, letting the ledger be viewed as at any past date.
- Showing "this bet was placed under an older strategy" markers in the sequence list.
- Bulk re-pricing tools for correcting a stretch of history.
