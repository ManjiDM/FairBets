Feature: Bet management

  Background:
    Given the FairBets app is available
    And I see the available balance as "€38.07"
    And I navigate to the Sequences view

  Scenario: Add and close a single bet from the Sequences view
    Then I should see 5 sequences
    When I press the Add Bet button
    Then I see the new bet dialog
    When I input the label "Single bet to close"
    And I input the date and time "2026-09-13T12:00"
    And I input "2.00" in the Odds field
    And I input "1" in the Manual Stake field
    And I press the Add button
    And the sequence containing the bet "Single bet to close" should be "Active"
    When I mark the bet "Single bet to close" as "Won"
    Then the bet "Single bet to close" should be "Won"
    And the sequence containing the bet "Single bet to close" should be "Closed"
    And I should see the bet settlement message
    Then I see the available balance as "€39.07"
 
  Scenario: Add an independent bet while another sequence is open
    When I start a fresh ledger
    And the Add Bet button should be enabled
    And I press the Add Bet button
    Then I see the new bet dialog
    When I input the label "First open sequence"
    And I input the date and time "2026-09-13T12:00"
    And I input "2.00" in the odds field
    And I press the Add button
    Then the sequence containing the bet "First open sequence" should be "Active"
    And the Add Bet button should be enabled
    When I press the Add Bet button
    Then I see the new bet dialog
    When I input the label "Second open sequence"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I press the Add button
    Then I should see 2 sequences
    And the bets "First open sequence" and "Second open sequence" should be in different sequences

  Scenario: Continue only the lost sequence and keep membership after reload
    When I start a fresh ledger
    And I add a bet labeled "Sequence A first bet" with odds "2.00" placed at "2026-09-13T12:00"
    Then the plus button for the sequence containing the bet "Sequence A first bet" should be hidden
    When I mark the bet "Sequence A first bet" as "Lost"
    Then the plus button for the sequence containing the bet "Sequence A first bet" should be visible
    When I add a bet labeled "Sequence B open bet" with odds "2.00" placed at "2026-09-13T13:00"
    And I press the plus button for the sequence containing the bet "Sequence A first bet"
    Then I see the new bet dialog
    When I input the label "Sequence A recovery"
    And I input the date and time "2026-09-13T14:00"
    And I input "2.00" in the odds field
    And I press the Add button
    Then the bets "Sequence A first bet" and "Sequence A recovery" should be in the same sequence
    And the bets "Sequence A recovery" and "Sequence B open bet" should be in different sequences
    And the plus button for the sequence containing the bet "Sequence A recovery" should be hidden
    When I reload the app
    Then the bets "Sequence A first bet" and "Sequence A recovery" should be in the same sequence
    And the bets "Sequence A recovery" and "Sequence B open bet" should be in different sequences

  Scenario: A win closes only its own sequence
    When I start a fresh ledger
    And I add a bet labeled "Sequence A open bet" with odds "2.00" placed at "2026-09-13T12:00"
    And I add a bet labeled "Sequence B open bet" with odds "2.00" placed at "2026-09-13T13:00"
    When I mark the bet "Sequence A open bet" as "Won"
    Then the sequence containing the bet "Sequence A open bet" should be "Closed"
    And the sequence containing the bet "Sequence B open bet" should be "Active"
    And the plus button for the sequence containing the bet "Sequence A open bet" should be hidden
    And the bet "Sequence B open bet" should be "Open"

  Scenario: Save and display odds with three decimal places
    When I press the Add Bet button
    Then I see the new bet dialog
    When I input the label "Three decimal odds"
    And I input the date and time "2026-09-14T12:00"
    And I input "1.234" in the odds field
    And I press the Add button
    Then the bet "Three decimal odds" should display odds "1.234"
    When I reload the app
    Then the bet "Three decimal odds" should display odds "1.234"
    When I update the odds for "Three decimal odds" to "1.235"
    Then the bet "Three decimal odds" should display odds "1.235"
    When I reload the app
    Then the bet "Three decimal odds" should display odds "1.235"
