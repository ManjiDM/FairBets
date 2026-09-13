Feature: FairBets app overview

  Background:
    Given the FairBets app is available

  Scenario: The app loads and shows the default ledger
    Then I should see the "FairBets demo" ledger
    And I should see the "Current ledger" section

  Scenario: A user can add a new bet
    When I navigate to the sequences view
    And I add a bet labeled "Test selection" with odds "2.00"
    Then the ledger should show the bet "Test selection"
