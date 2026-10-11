Feature: Start fresh with a confirmation modal
  As a person tracking my own bets
  I want to choose what Start fresh clears and confirm it in the app
  So that I never wipe my sequences or my ledger history by accident

  Scenario: Start fresh opens a confirmation modal instead of a system dialog
    Given the FairBets app is available
    When I press Start fresh in the settings
    Then the "Start fresh" dialog should be shown
    And "Clear sequences" should be switched on
    And "Clear ledgers" should be switched off
    And the "Start fresh" dialog should have Confirm and Cancel buttons
    And no system dialog should have been shown

  Scenario: Cancel changes nothing
    Given the FairBets app is available
    When I press Start fresh in the settings
    And I cancel the Start fresh dialog
    Then the "Start fresh" dialog should be closed
    And I should see 5 sequences

  Scenario: Confirm is disabled when nothing is selected
    Given the FairBets app is available
    When I press Start fresh in the settings
    And I switch "Clear sequences" off
    Then the Start fresh Confirm button should be disabled

  Scenario: Clearing sequences starts an empty ledger and keeps the ledgers
    Given the FairBets app is available
    When I start a fresh ledger
    And I add an investment of "20" on the Ledgers tab
    And I press Start fresh in the settings
    And I confirm the Start fresh dialog
    And I open the Ledgers tab
    Then the "Total invested" figure should be "€57.92"
    And the ledger should have no bets

  Scenario: Clearing ledgers keeps the sequences
    Given the FairBets app is available
    When I open the Ledgers tab
    And I add an investment of "20"
    And I press Start fresh in the settings
    And I switch "Clear sequences" off
    And I switch "Clear ledgers" on
    And I confirm the Start fresh dialog
    When I open the Sequences tab
    Then I should see 5 sequences
    When I open the Ledgers tab
    Then the "Total invested" figure should be "€37.92"
    And the "Available funds" figure should be "€0.00"

  Scenario: Clearing both starts over
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "10"
    And I press Start fresh in the settings
    And I switch "Clear ledgers" on
    And I confirm the Start fresh dialog
    And I open the Ledgers tab
    Then "Ledger 1 New FairBets ledger" should be the only ledger card
    And the "Total invested" figure should be "€37.92"
    And the "Available funds" figure should be "€0.00"
    And the ledger should have no bets
