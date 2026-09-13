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
    When I navigate the Overview view
    Then I see the available balance as "€39.17"
 
  Scenario: Add new a bet when another is open is prevented
    Then I should see 5 sequences
    And the Add Bet button should be enabled
    When I press the Add Bet button
    Then I see the new bet dialog
    When I input the label "Single bet to close"
    And I input the date and time "2026-09-13T12:00"
    And I input "2.00" in the odds field
    And I press the Add button
    Then the sequence containing the bet "Single bet to close" should be "Active"
    And the Add Bet button should be disabled
    When I mark the bet "Single bet to close" as "Won"
    Then the bet "Single bet to close" should be "Won"
    And the Add Bet button should be enabled
