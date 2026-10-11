Feature: Ledger lifecycle with investments and closing statistics
  As a person tracking my own bets in rounds
  I want to close a ledger, keep its final statistics and start the next one
  So that I know how much I invested, what I earned and what I can start with

  Scenario: The funds start from the saved ledger's balance
    Given the FairBets app is available
    When I open the Ledgers tab
    Then the "Total invested" figure should be "€37.92"
    And the "Realised result" figure should be "€0.00"
    And the "Available funds" figure should be "€0.00"

  Scenario: An investment is timestamped and adds to the available funds
    Given the FairBets app is available
    When I open the Ledgers tab
    And I add an investment of "20"
    Then the "Total invested" figure should be "€57.92"
    And the "Available funds" figure should be "€20.00"
    And the latest history entry should read "Investment"
    And the latest history entry should read "€20.00"
    And the latest history entry should show a timestamp

  Scenario: An investment must be above zero
    Given the FairBets app is available
    When I open the Ledgers tab
    And I add an investment of "0"
    Then the ledgers message should read "Investment must be above zero."
    And the "Total invested" figure should be "€37.92"

  Scenario: A ledger with open bets cannot be closed
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Still open" with odds "2.00"
    And I open the Ledgers tab
    And I close the active ledger
    Then the ledgers message should read "Settle every open bet before closing the ledger."
    And the ledger should still be active

  Scenario: Closing a ledger keeps its final statistics
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    Then the ledger card "New FairBets ledger" should show "Starting balance" as "€37.92"
    And the ledger card "New FairBets ledger" should show "Final balance" as "€38.02"
    And the ledger card "New FairBets ledger" should show "Net result" as "+€0.10"
    And the ledger card "New FairBets ledger" should show "Wins" as "1"
    And the "Realised result" figure should be "+€0.10"
    And the "Available funds" figure should be "€38.02"
    And no ledger should be active

  Scenario: Bets cannot be added while no ledger is active
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    And I open the Sequences tab
    Then I should be told there is no active ledger
    And the Add Bet button should be disabled

  Scenario: A new ledger cannot start above the available funds
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "38.03"
    Then the ledgers message should read "Starting balance cannot exceed the available funds of €38.02."
    And no ledger should be active

  Scenario: A new ledger can start at exactly the available funds
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "38.02"
    And I open the Sequences tab
    Then the ledger title should be "Second round"
    And I see the available balance as "€38.02"
    And I open the Ledgers tab
    And the "Available funds" figure should be "€0.00"
    And the history should list "Ledger opened" before "Ledger closed"

  Scenario: The new ledger form is pre-filled from the previous ledger
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    Then the new ledger form should have "Base stake" set to "0.1"
    And the new ledger form should have "Max stake" set to "15"

  Scenario: Only one ledger can be active at a time
    Given the FairBets app is available
    When I open the Ledgers tab
    Then I should not be able to start a new ledger
    And the ledger should still be active

  Scenario: Closed ledgers and investments are kept after a reload
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    And I add an investment of "5"
    And I reload the app
    And I open the Ledgers tab
    Then the ledger card "New FairBets ledger" should show "Net result" as "€0.00"
    And the "Total invested" figure should be "€42.92"
    And no ledger should be active

  Scenario: A ledger saved before ledgers existed still loads
    Given the FairBets app is available
    When I remove the saved ledger history and reload
    And I open the Ledgers tab
    Then the "Total invested" figure should be "€37.92"
    And the ledger should still be active
    And I open the Sequences tab
    And I see the available balance as "€38.07"

  Scenario: The app has Sequences and Ledgers tabs
    Given the FairBets app is available
    Then the "Sequences" tab should be selected
    And I should see the sequences list
    When I open the Ledgers tab
    Then the "Ledgers" tab should be selected
    And I should not see the sequences list
    And I should not see a ledgers dialog

  Scenario: Ledger cards are numbered and newest first
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "10"
    Then the ledger cards should be listed as "Ledger 2 Second round", "Ledger 1 New FairBets ledger"

  Scenario: A card shows its net result and profit percentage
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    Then the collapsed card "Ledger 1" should show net result "+€0.10" and profit "+0.26%"

  Scenario: A card expands to show the rest of its statistics
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    Then the card "Ledger 1" should be collapsed
    When I click the card "Ledger 1"
    Then the card "Ledger 1" should be expanded
    And the ledger card "New FairBets ledger" should show "Win rate" as "0%"
    When I click the card "Ledger 1"
    Then the card "Ledger 1" should be collapsed

  Scenario: The active ledger card shows live figures
    Given the FairBets app is available
    When I open the Ledgers tab
    Then the collapsed card "Ledger 1" should show net result "+€0.15" and profit "+0.40%"

  Scenario: Ledgers page text is readable
    Given the FairBets app is available
    When I open the Ledgers tab
    Then the Ledgers page headings and labels should have readable contrast

  Scenario: Funds are shown as pills on the dark background
    Given the FairBets app is available
    When I open the Ledgers tab
    Then the funds should be shown as pills
    And the Ledgers page sections should have no white panel

  Scenario: Ledger cards use the full page width
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    Then the ledger cards should be as wide as the page content

  Scenario: The first bet button is disabled with no active ledger
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    And I open the Sequences tab
    Then the "Add the first bet" button should be disabled

  Scenario: A card shows its id and status
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "10"
    Then the card "Ledger 1" should show the status "Closed"
    And the card "Ledger 2" should show the status "Open"
    And the card ids should be uppercase

  Scenario: The ledger card has no chevron
    Given the FairBets app is available
    When I open the Ledgers tab
    Then no ledger card should have an expand chevron

  Scenario: Expanded statistics use two columns with uppercase labels
    Given the FairBets app is available
    When I open the Ledgers tab
    And I click the card "Ledger 1"
    Then the statistics of the card "Ledger 1" should be in 2 columns with uppercase labels

  Scenario: Only closed ledgers can be deleted
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "10"
    Then the card "Ledger 1" should have a Delete button
    And the card "Ledger 2" should not have a Delete button

  Scenario: Deleting a closed ledger removes its result
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "10"
    Then the "Realised result" figure should be "+€0.10"
    When I delete the card "Ledger 1"
    Then the ledger cards should be listed as "Ledger 1 Second round"
    And the "Realised result" figure should be "€0.00"

  Scenario: Deleting is refused when the funds are committed
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    And I start a new ledger named "Second round" with a starting balance of "38.02"
    And I delete the card "Ledger 1"
    Then the ledgers message should read "Ledger 1 cannot be deleted: its result funds the active ledger."
    And the card "Ledger 1" should show the status "Closed"

  Scenario: A closed ledger runs from its first bet to its closing
    Given the FairBets app is available
    When I start a fresh ledger
    And the browser clock is set to "2026-10-13T09:30:00"
    And I add a bet labeled "Dated round" with odds "2.00"
    And I mark the bet "Dated round" as "Won"
    And the browser clock is set to "2026-10-14T18:45:00"
    And I open the Ledgers tab
    And I close the active ledger
    Then the dates of the card "Ledger 1" should read "13 Oct 2026, 09:30 to 14 Oct 2026, 18:45"

  Scenario: The active ledger shows when its first bet was created
    Given the FairBets app is available
    When I start a fresh ledger
    And the browser clock is set to "2026-10-13T09:30:00"
    And I add a bet labeled "Dated round" with odds "2.00"
    And I open the Ledgers tab
    Then the dates of the card "Ledger 1" should read "Started 13 Oct 2026, 09:30"

  Scenario: A ledger without bets has no first-bet date
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    Then the dates of the card "Ledger 1" should read "No bets yet"
    When I close the active ledger
    Then the dates of the card "Ledger 1" should read "No bets recorded"

  Scenario: Primary buttons are flat like the Add bet button
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I press Close ledger
    Then the "Confirm close" button should be flat
    When I confirm closing the ledger
    Then the "Start ledger" button should be flat
    When I open the Sequences tab
    Then the "Add the first bet" button should be flat

  Scenario: Confirm close replaces the Close ledger button
    Given the FairBets app is available
    When I open the Ledgers tab
    And I press Close ledger
    Then the "Confirm close" button should be shown
    And the "Close ledger" button should not be shown

  Scenario: A refused close keeps the Close ledger button
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Still open" with odds "2.00"
    And I open the Ledgers tab
    And I press Close ledger
    Then the "Close ledger" button should be shown
    And the "Confirm close" button should not be shown

  Scenario: The new ledger name starts empty and is mandatory
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    Then the new ledger form should have "Ledger name" set to ""
    When I start a ledger with no name
    Then the ledgers message should read "Give the new ledger a name."

  Scenario: The new ledger starting balance defaults to the available funds
    Given the FairBets app is available
    When I start a fresh ledger
    And I add a bet labeled "Closing round" with odds "2.00"
    And I mark the bet "Closing round" as "Won"
    And I open the Ledgers tab
    And I close the active ledger
    Then the new ledger form should have "Starting balance" set to "38.02"
    When I add an investment of "20"
    Then the new ledger form should have "Starting balance" set to "58.02"

  Scenario: The new ledger goal rate and recovery weight default to 100
    Given the FairBets app is available
    When I start a fresh ledger
    And I open the Ledgers tab
    And I close the active ledger
    Then the new ledger form should have "Goal rate (%)" set to "100"
    And the new ledger form should have "Recovery weight (%)" set to "100"