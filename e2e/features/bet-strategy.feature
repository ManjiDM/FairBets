Feature: Recorded strategy values

  A bet keeps the strategy it was placed under. Changing the strategy later
  applies to upcoming bets only, while risk warnings stay on current settings.

  Background:
    Given the FairBets app is available
    And I navigate to the Sequences view
    And I start a fresh ledger

  Scenario: Raising the base stake leaves settled history untouched
    Given I note the available balance
    When I set the base stake to "0.20"
    Then the available balance should be unchanged

  Scenario: Raising the base stake leaves an open bet untouched
    When I add a bet labeled "Open exposure" with odds "2.00"
    Then the bet "Open exposure" should have a stake of "€0.10"
    Given I note the available balance
    When I set the base stake to "0.20"
    Then the bet "Open exposure" should have a stake of "€0.10"
    And the available balance should be unchanged

  Scenario: The new base stake applies to the next bet
    When I set the base stake to "0.20"
    And I add a bet labeled "Priced at the new base" with odds "2.00"
    Then the bet "Priced at the new base" should have a stake of "€0.20"

  Scenario: Full goal rate recovers a loss and earns one euro net
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    Then I see the available balance as "€100.00"
    And I add a bet labeled "First loss" with odds "1.50" and a manual stake of "1" placed at "2026-09-10T10:00"
    And I mark the bet "First loss" as "Lost"
    When I press the plus button for the sequence containing the bet "First loss"
    Then I see the new bet dialog
    When I input the label "Recovery win"
    And I input the date and time "2026-09-11T10:00"
    And I input "1.50" in the odds field
    Then the suggested stake should be "€4.00"
    And I submit the prepared bet
    And the bet "Recovery win" should have a stake of "€4.00"
    And I mark the bet "Recovery win" as "Won"
    Then the sequence containing the bet "Recovery win" should be "Closed"
    And the settled P&L should be "+€1.00"
    And I see the available balance as "€101.00"

  Scenario: A new sequence recovers the ledger-wide goal shortfall
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    And I add a bet labeled "Lead-in loss" with odds "1.50" placed at "2026-09-10T10:00"
    And I mark the bet "Lead-in loss" as "Lost"
    When I press the plus button for the sequence containing the bet "Lead-in loss"
    Then I see the new bet dialog
    When I input the label "Lead-in win"
    And I input the date and time "2026-09-11T10:00"
    And I input "1.50" in the odds field
    And I input "2" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Lead-in win" as "Won"
    Then the sequence containing the bet "Lead-in win" should be "Closed"
    And I see the available balance as "€100.00"
    When I prepare a bet labeled "New sequence" with odds "1.50" placed at "2026-09-12T10:00"
    Then the suggested stake should be "€3.00"
    And I submit the prepared bet
    And the bet "New sequence" should have a stake of "€3.00"
    And the bet "Lead-in loss" should have a stake of "€1.00"
    When I reload the app
    Then the bet "New sequence" should have a stake of "€3.00"
    And the bet "Lead-in loss" should have a stake of "€1.00"

  Scenario: An active recovery sequence reserves the global shortfall
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    And I add a bet labeled "Allocation lead-in loss" with odds "1.50" placed at "2026-09-10T10:00"
    And I mark the bet "Allocation lead-in loss" as "Lost"
    When I press the plus button for the sequence containing the bet "Allocation lead-in loss"
    Then I see the new bet dialog
    When I input the label "Allocation lead-in win"
    And I input the date and time "2026-09-11T10:00"
    And I input "1.50" in the odds field
    And I input "2" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Allocation lead-in win" as "Won"
    When I prepare a bet labeled "Recovery allocation" with odds "1.50" placed at "2026-09-12T10:00"
    Then the suggested stake should be "€3.00"
    When I input "2" in the Manual Stake field
    And I submit the prepared bet
    Then the bet "Recovery allocation" should have a stake of "€2.00"
    When I prepare a bet labeled "Parallel base bet" with odds "1.50" placed at "2026-09-13T10:00"
    Then the suggested stake should be "€1.00"
    When I submit the prepared bet
    And I mark the bet "Recovery allocation" as "Won"
    When I prepare a bet labeled "Remaining recovery" with odds "1.50" placed at "2026-09-14T10:00"
    Then the suggested stake should be "€2.00"

  Scenario: An active sequence recovering a loss blocks duplicate global recovery
    When I start a fresh ledger
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    And I add a bet labeled "Active sequence loss" with odds "1.50" and a manual stake of "1" placed at "2026-09-10T10:00"
    And I mark the bet "Active sequence loss" as "Lost"
    And I add a bet labeled "Parallel sequence loss" with odds "1.50" and a manual stake of "1" placed at "2026-09-11T10:00"
    And I mark the bet "Parallel sequence loss" as "Lost"
    When I press the plus button for the sequence containing the bet "Active sequence loss"
    Then I see the new bet dialog
    When I input the label "Sequence continuation"
    And I input the date and time "2026-09-12T10:00"
    And I input "1.50" in the odds field
    Then the suggested stake should be "€4.00"
    When I cancel the bet form
    And I prepare a bet labeled "Independent base bet" with odds "1.50" placed at "2026-09-13T10:00"
    Then the suggested stake should be "€1.00"
    When I submit the prepared bet
    Then the bet "Independent base bet" should have a stake of "€1.00"

  Scenario: A new sequence starts at base stake when the goal is met
    When I start a fresh ledger
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    And I add a bet labeled "Target met" with odds "1.50" placed at "2026-09-10T10:00"
    And I mark the bet "Target met" as "Won"
    When I prepare a bet labeled "At target" with odds "1.50" placed at "2026-09-11T10:00"
    Then the suggested stake should be "€1.00"

  Scenario: A sequence that spans a strategy change stays one sequence
    When I add a bet labeled "Before the change" with odds "2.00" placed at "2026-09-10T10:00"
    And I mark the bet "Before the change" as "Lost"
    And I set the base stake to "0.20"
    And I press the plus button for the sequence containing the bet "Before the change"
    Then I see the new bet dialog
    When I input the label "After the change"
    And I input the date and time "2026-09-11T10:00"
    And I input "2.00" in the odds field
    And I press the Add button
    Then the bet "Before the change" should have a stake of "€0.10"
    And the bet "After the change" should have a stake of "€0.40"
    And the sequence containing the bet "After the change" should be "Active"

  Scenario: Raising the maximum stake does not re-price a capped bet
    When I set the maximum stake to "0.10"
    And I add a bet labeled "Lead in" with odds "2.00" placed at "2026-09-10T10:00"
    And I mark the bet "Lead in" as "Lost"
    And I add a bet labeled "Capped bet" with odds "2.00" placed at "2026-09-11T10:00"
    Then the bet "Capped bet" should have a stake of "€0.10"
    When I set the maximum stake to "15"
    Then the bet "Capped bet" should have a stake of "€0.10"

  Scenario: Lowering the maximum stake still warns about historical stakes
    When I add a bet labeled "Large stake" with odds "2.00" and a manual stake of "10"
    And I set the maximum stake to "5"
    Then a guardrail warning should be shown
    And the bet "Large stake" should have a stake of "€10.00"

  Scenario: Editing a bet does not re-stamp its strategy values
    When I add a bet labeled "Keeps its values" with odds "2.00"
    And I set the base stake to "0.20"
    And I rename the bet "Keeps its values" to "Renamed but unchanged"
    Then the bet "Renamed but unchanged" should have a stake of "€0.10"
    And the bet "Renamed but unchanged" should show a recorded base stake of "0.1"

  Scenario: Correcting a mis-recorded base stake re-prices only that bet
    When I add a bet labeled "Left alone" with odds "2.00" placed at "2026-09-10T10:00"
    And I mark the bet "Left alone" as "Won"
    And I add a bet labeled "Mis-recorded" with odds "2.00" placed at "2026-09-11T10:00"
    Then the bet "Mis-recorded" should have a stake of "€0.10"
    When I correct the recorded base stake of the bet "Mis-recorded" to "0.20"
    Then the bet "Mis-recorded" should have a stake of "€0.20"
    And the bet "Left alone" should have a stake of "€0.10"

  Scenario: An invalid correction is rejected
    When I add a bet labeled "Invalid correction" with odds "2.00"
    And I correct the recorded base stake of the bet "Invalid correction" to "0"
    Then the bet form should show a validation message
    When I cancel the bet form
    Then the bet "Invalid correction" should show a recorded base stake of "0.1"
    And the bet "Invalid correction" should have a stake of "€0.10"
