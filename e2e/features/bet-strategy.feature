Feature: Recorded strategy values

  A bet keeps the strategy it was placed under. Changing the strategy later
  applies to upcoming bets only, while risk warnings stay on current settings.

  Background:
    Given the FairBets app is available
    And I navigate to the Sequences view

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

  Scenario: A sequence that spans a strategy change stays one sequence
    When I add a bet labeled "Before the change" with odds "2.00" placed at "2026-09-10T10:00"
    And I mark the bet "Before the change" as "Lost"
    And I set the base stake to "0.20"
    And I add a bet labeled "After the change" with odds "2.00" placed at "2026-09-11T10:00"
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
