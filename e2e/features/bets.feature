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

  Scenario: Add Bet and outcome actions are accessible icon-only buttons
    When I start a fresh ledger
    Then the button named "Add bet" should be icon-only
    When I press the Add Bet button
    Then I see the new bet dialog
    And the button named "Add bet" should be icon-only
    When I cancel the bet form
    And I add a bet labeled "Icon actions" with odds "2.00" placed at "2026-09-13T12:00"
    Then the button named "Won" should be icon-only
    And the button named "Lost" should be icon-only
    And the button named "Cancelled" should be icon-only

  Scenario: The sequence toolbar groups Add Bet with filters
    When I navigate to the Sequences view
    Then the all-status filter should be named "All"
    And the Add Bet button should be in the sequence filter row
    When I press the Add Bet button
    Then I see the new bet dialog

  Scenario: The sequence toolbar remains usable on mobile
    Given the viewport is a small phone
    Then the all-status filter should be named "All"
    And the Add Bet button should be in the sequence filter row
    And the page should not overflow horizontally

  Scenario: The Add Bet button is right-aligned on desktop
    When I navigate to the Sequences view
    Then the Add Bet button should be right-aligned with the sequence filter controls

  Scenario: The Add Bet button is right-aligned on mobile
    Given the viewport is a small phone
    Then the Add Bet button should be right-aligned with the sequence filter controls

  Scenario: Bet and sequence card actions use accessible icons
    When I start a fresh ledger
    And I add a bet labeled "Icon action first" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Icon action first" as "Lost"
    Then the Edit and Delete actions for bet "Icon action first" should be icon-only
    When I press the plus button for the sequence containing the bet "Icon action first"
    And I input the label "Icon action second"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I input "1" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Icon action second" as "Lost"
    Then the Delete action for the sequence containing bet "Icon action second" should be icon-only
    And the Edit and Delete actions for bet "Icon action first" should be icon-only
    When I press the plus button for the sequence containing the bet "Icon action second"
    And I input the label "Icon action closing win"
    And I input the date and time "2026-09-13T14:00"
    And I input "2.00" in the odds field
    And I input "1" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Icon action closing win" as "Won"
    Then the Delete action for the sequence containing bet "Icon action first" should be icon-only
    And I toggle the sequence summary for bet "Icon action first"
    Then the Delete action for the sequence containing bet "Icon action first" should be icon-only
    And the Edit and Delete actions for bet "Icon action second" should be icon-only
    And the Edit and Delete actions for bet "Icon action first" should be icon-only
    When I request deletion of bet "Icon action first"
    Then the Confirm deletion action for bet "Icon action first" should be icon-only
    When I cancel deletion by clicking outside its button
    Then the Edit and Delete actions for bet "Icon action first" should be icon-only
    And the bet "Icon action first" should be "Lost"
    When I add a bet labeled "Icon cancelled bet" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T15:00"
    And I mark the bet "Icon cancelled bet" as "Cancelled"
    Then the Edit and Delete actions for bet "Icon cancelled bet" should be icon-only

  Scenario: Sequence actions use icons and the summary toggles details
    When I start a fresh ledger
    And I add a bet labeled "Icon sequence first" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Icon sequence first" as "Lost"
    Then the button named "Close sequence" should be icon-only
    And the button named "Add bet to sequence 1" should be icon-only
    When I press the plus button for the sequence containing the bet "Icon sequence first"
    Then I see the new bet dialog
    When I input the label "Icon sequence second"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I press the Add button
    And I mark the bet "Icon sequence second" as "Won"
    Then the collapsed sequence should have no View button
    When I request deletion of the collapsed sequence containing bet "Icon sequence first"
    Then the sequence details for bet "Icon sequence first" should be collapsed
    When I toggle the sequence summary for bet "Icon sequence first"
    Then the sequence details for bet "Icon sequence first" should be expanded
    When I press Enter on the sequence summary for bet "Icon sequence first"
    Then the sequence details for bet "Icon sequence first" should be collapsed
    When I press Space on the sequence summary for bet "Icon sequence first"
    Then the sequence details for bet "Icon sequence first" should be expanded
 
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
    And I input the date and time "2026-09-13T11:00"
    And I input "2.00" in the odds field
    And I press the Add button
    Then I should see 2 sequences
    And the bets "First open sequence" and "Second open sequence" should be in different sequences

  Scenario: Newest recorded sequence appears first when placement times tie
    When I start a fresh ledger
    And I add a bet labeled "Recorded first" with odds "2.00" placed at "2026-09-13T12:00"
    And I add a bet labeled "Recorded second" with odds "2.00" placed at "2026-09-13T12:00"
    Then the sequence card titles should be ordered as "Recorded second" then "Recorded first"
    And the recording time should display seconds without milliseconds for "Recorded second"
    When I reload the app
    Then the sequence card titles should be ordered as "Recorded second" then "Recorded first"
    And the recording time should display seconds without milliseconds for "Recorded second"
    And I freeze the browser clock at "2026-10-05T12:00:00"
    When I remove recording timestamps from saved bets and reload
    Then the sequence card titles should be ordered as "Recorded second" then "Recorded first"
    And the recording timestamps for "Recorded first" and "Recorded second" should be unique within the same second

  Scenario: A newly recorded backdated sequence appears first
    When I start a fresh ledger
    And I add a bet labeled "Later placement" with odds "2.00" placed at "2026-09-13T13:00"
    And I add a bet labeled "Earlier placement" with odds "2.00" placed at "2026-09-13T11:00"
    Then the sequence card titles should be ordered as "Earlier placement" then "Later placement"

  Scenario: Placement seconds control calculations while recording time controls row order
    When I start a fresh ledger
    And I add a bet labeled "Later placement entered first" with odds "1.50" and a manual stake of "1" placed at "2026-09-13T12:00:45"
    And I mark the bet "Later placement entered first" as "Lost"
    And I press the plus button for the sequence containing the bet "Later placement entered first"
    Then I see the new bet dialog
    When I input the label "Earlier placement entered second"
    And I input the date and time "2026-09-13T12:00:15"
    And I input "1.50" in the odds field
    And I press the Add button
    Then the saved placement time for bet "Earlier placement entered second" should be "2026-09-13T12:00:15"
    And the bet rows should be ordered by recording time as "Later placement entered first" then "Earlier placement entered second"
    And the bet "Later placement entered first" should show calculated position "Bet 2"
    And the bet "Earlier placement entered second" should show calculated position "Bet 1"
    When I reload the app
    Then the saved placement time for bet "Earlier placement entered second" should be "2026-09-13T12:00:15"
    And the bet rows should be ordered by recording time as "Later placement entered first" then "Earlier placement entered second"
    When I open the edit form for bet "Earlier placement entered second"
    Then the date and time field should contain "2026-09-13T12:00:15"
    When I edit the placement time to "2026-09-13T12:00:25"
    Then the saved placement time for bet "Earlier placement entered second" should be "2026-09-13T12:00:25"
    And the bet rows should be ordered by recording time as "Later placement entered first" then "Earlier placement entered second"

  Scenario: Bets recorded in the same second receive unique millisecond timestamps
    When I start a fresh ledger
    And I freeze the browser clock at "2026-10-05T12:00:00"
    And I add a bet labeled "First same-second bet" with odds "1.50" placed at "2026-09-13T12:00:15"
    And I add a bet labeled "Second same-second bet" with odds "1.50" placed at "2026-09-13T12:00:15"
    Then the recording timestamps for "First same-second bet" and "Second same-second bet" should be unique within the same second
    And the saved recording timestamps should be ordered as "First same-second bet" then "Second same-second bet"
    And the sequence card titles should be ordered as "Second same-second bet" then "First same-second bet"
    And the recording time should display seconds without milliseconds for "Second same-second bet"

  Scenario: Legacy duplicate recording timestamps are normalized on load
    When I start a fresh ledger
    And I freeze the browser clock at "2026-10-05T12:00:59.999"
    And I add a bet labeled "Legacy first" with odds "1.50" placed at "2026-09-13T12:00:15"
    And I add a bet labeled "Legacy second" with odds "1.50" placed at "2026-09-13T12:00:45"
    And I set the recording timestamps for "Legacy first" and "Legacy second" to the same value
    When I reload the app
    Then the recording timestamps for "Legacy first" and "Legacy second" should be unique within the same second
    And the saved recording timestamps should be ordered as "Legacy first" then "Legacy second"

  Scenario: Odds replace a generated title while custom labels stay visible
    When I start a fresh ledger
    And I press the Add Bet button
    And I input the date and time "2026-09-13T12:00"
    And I input "1.30" in the odds field
    And I press the Add button
    Then the prominent title should show "@ 1.30"
    When I update the odds for the generated-title bet to "1.35"
    Then the prominent title should show "@ 1.35"
    And no generated Selection title should be shown
    When I add a bet labeled "Home team" with odds "1.40" placed at "2026-09-13T13:00"
    Then the prominent title "Home team" should be visible

  Scenario: Filter bet descriptions by a partial match
    When I start a fresh ledger
    And I add a bet labeled "Home 123456" with odds "1.20" placed at "2026-09-13T12:00"
    And I add a bet labeled "Away 654321" with odds "1.35" placed at "2026-09-13T13:00"
    Then the description "Home 123456 @ 1.20" should be visible
    And the description "Away 654321 @ 1.35" should be visible
    When I filter the bet list by description "1234"
    Then the description "Home 123456 @ 1.20" should be visible
    And the description "Away 654321 @ 1.35" should not be visible
    When I filter the bet list by description "hOmE 1234"
    Then the description "Home 123456 @ 1.20" should be visible
    And the description "Away 654321 @ 1.35" should not be visible
    When I filter the bet list by description "not a match"
    Then the bet list should say no descriptions match
    When I filter the bet list by description ""
    Then the description "Home 123456 @ 1.20" should be visible
    And the description "Away 654321 @ 1.35" should be visible

  Scenario: A matching bet shows the rest of its sequence
    When I start a fresh ledger
    And I add a bet labeled "Sequence 123456" with odds "1.50" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Sequence 123456" as "Lost"
    And I press the plus button for the sequence containing the bet "Sequence 123456"
    Then I see the new bet dialog
    When I input the label "Another sequence bet"
    And I input the date and time "2026-09-13T13:00"
    And I input "1.50" in the odds field
    And I press the Add button
    When I filter the bet list by description "1234"
    Then the description "Sequence 123456 @ 1.50" should be visible
    And the description "Another sequence bet @ 1.50" should be visible

  Scenario: Filter sequences by the number label on their card
    When I start a fresh ledger
    And I add a bet labeled "Label first" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Label first" as "Lost"
    And I press the plus button for the sequence containing the bet "Label first"
    And I input the label "Label second"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I input "1" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Label second" as "Won"
    And I add a bet labeled "Label third" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T14:00"
    When I filter the bet list by description "sequence 1"
    Then the description "Label first @ 2.00" should be visible
    And the description "Label second @ 2.00" should be visible
    And the description "Label third @ 2.00" should not be visible
    When I filter the bet list by description "bet 2"
    Then the description "Label third @ 2.00" should be visible
    And the description "Label first @ 2.00" should not be visible
    And the description "Label second @ 2.00" should not be visible
    When I filter the bet list by description "sequence 9"
    Then the bet list should say no descriptions match
  Scenario: Filter standalone cancelled bet descriptions
    When I start a fresh ledger
    And I add a bet labeled "Cancelled 123456" with odds "1.20" placed at "2026-09-13T12:00"
    And I add a bet labeled "Cancelled 654321" with odds "1.35" placed at "2026-09-13T13:00"
    And I mark the bet "Cancelled 123456" as "Cancelled"
    And I mark the bet "Cancelled 654321" as "Cancelled"
    Then the standalone cancelled cards should be ordered as "Cancelled 654321" then "Cancelled 123456"
    When I filter the bet list by description "1234"
    Then the cancelled description "Cancelled 123456 @ 1.20" should be visible
    And the cancelled description "Cancelled 654321 @ 1.35" should not be visible

  Scenario: Description search retains the selected sequence status filter
    When I start a fresh ledger
    And I add a bet labeled "Active search target" with odds "1.50" placed at "2026-09-13T12:00"
    And I add a bet labeled "Closed search target" with odds "1.50" placed at "2026-09-13T13:00"
    And I mark the bet "Closed search target" as "Won"
    When I filter the bet list by description "search target"
    And I select the sequence status filter "Closed"
    Then the description "Closed search target @ 1.50" should be visible
    And the description "Active search target @ 1.50" should not be visible
    When I select the sequence status filter "Active"
    Then the description "Active search target @ 1.50" should be visible
    And the description "Closed search target @ 1.50" should not be visible

  Scenario: A custom label that resembles a generated title is retained
    When I start a fresh ledger
    And I add a bet labeled "Selection 09" with odds "1.50" placed at "2026-09-13T14:00"
    Then the prominent title "Selection 09" should be visible

  Scenario: Continue only the lost sequence and keep membership after reload
    When I start a fresh ledger
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    And I add a bet labeled "Prior profit" with odds "2.00" and a manual stake of "10" placed at "2026-09-13T11:00"
    And I mark the bet "Prior profit" as "Won"
    And I add a bet labeled "Sequence A first bet" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    Then the plus button for the sequence containing the bet "Sequence A first bet" should be hidden
    When I mark the bet "Sequence A first bet" as "Lost"
    Then the plus button for the sequence containing the bet "Sequence A first bet" should be visible
    When I add a bet labeled "Sequence B open bet" with odds "2.00" placed at "2026-09-13T13:00"
    And I press the plus button for the sequence containing the bet "Sequence A first bet"
    Then I see the new bet dialog
    When I input the label "Sequence A recovery"
    And I input the date and time "2026-09-13T14:00"
    And I input "2.00" in the odds field
    Then the suggested stake should be "€3.00"
    And I press the Add button
    Then the bet "Sequence A recovery" should have a stake of "€3.00"
    Then the bets "Sequence A first bet" and "Sequence A recovery" should be in the same sequence
    And the bets "Sequence A recovery" and "Sequence B open bet" should be in different sequences
    And the plus button for the sequence containing the bet "Sequence A recovery" should be hidden
    When I reload the app
    Then the bets "Sequence A first bet" and "Sequence A recovery" should be in the same sequence
    And the bets "Sequence A recovery" and "Sequence B open bet" should be in different sequences
    And the sequence containing the bet "Sequence A recovery" should be "Active"
    And the sequence containing the bet "Sequence B open bet" should be "Active"
    And the bet "Sequence A recovery" should have a stake of "€3.00"

  Scenario: A win closes only its own sequence
    When I start a fresh ledger
    And I add a bet labeled "Sequence A open bet" with odds "2.00" placed at "2026-09-13T12:00"
    And I add a bet labeled "Sequence B open bet" with odds "2.00" placed at "2026-09-13T13:00"
    When I mark the bet "Sequence A open bet" as "Won"
    Then the sequence containing the bet "Sequence A open bet" should be "Closed"
    And the sequence containing the bet "Sequence B open bet" should be "Active"
    And the plus button for the sequence containing the bet "Sequence A open bet" should be hidden
    And the bet "Sequence B open bet" should be "Open"

  Scenario: Close a sequence after accepting its settled loss
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I add a bet labeled "Accepted loss" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Accepted loss" as "Lost"
    Then the close button for the sequence containing the bet "Accepted loss" should be visible
    And the button named "Close sequence" should be icon-only
    And the settled P&L should be "-€1.00"
    When I close the sequence containing the bet "Accepted loss"
    Then the sequence containing the bet "Accepted loss" should be "Closed"
    And the saved outcome for the bet "Accepted loss" should be "lost"
    And the settled P&L should be "-€1.00"
    And the sequence containing the bet "Accepted loss" should not offer a continue action
    When I rename the bet "Accepted loss" to "Accepted loss, edited"
    Then the sequence containing the bet "Accepted loss, edited" should be "Closed"
    And the sequence containing the bet "Accepted loss, edited" should not offer a continue action
    When I reload the app
    Then the sequence containing the bet "Accepted loss, edited" should be "Closed"
    And the settled P&L should be "-€1.00"
    And the sequence containing the bet "Accepted loss, edited" should not offer a continue action

  Scenario: An open bet cannot be manually closed
    When I start a fresh ledger
    And I add a bet labeled "Still open" with odds "2.00" placed at "2026-09-13T12:00"
    Then the close button for the sequence containing the bet "Still open" should be hidden
    And the bet "Still open" should be "Open"

  Scenario: Close a multi-bet sequence after its latest loss
    When I start a fresh ledger
    And I add a bet labeled "First loss" with odds "2.00" placed at "2026-09-13T12:00"
    And I mark the bet "First loss" as "Lost"
    And I press the plus button for the sequence containing the bet "First loss"
    Then I see the new bet dialog
    When I input the label "Second loss"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I press the Add button
    And I mark the bet "Second loss" as "Lost"
    Then the close button for the sequence containing the bet "Second loss" should be visible
    When I close the sequence containing the bet "Second loss"
    Then the sequence containing the bet "Second loss" should be "Closed"
    And the sequence containing the bet "Second loss" should not offer a continue action

  Scenario: Open exposure from parallel sequences shares the configured limit
    When I start a fresh ledger
    And I add a bet labeled "First exposure" with odds "2.00" and a manual stake of "3" placed at "2026-09-13T12:00"
    And I add a bet labeled "Second exposure" with odds "2.00" and a manual stake of "3" placed at "2026-09-13T13:00"
    Then a guardrail warning should be shown

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

  Scenario: Cancel an open bet and return its stake
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I add a bet labeled "Open cancellation" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    Then I see the available balance as "€99.00"
    When I cancel the open bet "Open cancellation"
    Then the bet "Open cancellation" should be "Cancelled"
    And the bet "Open cancellation" should have a stake of "€1.00"
    And the settled P&L should be "€0.00"
    And cancellation should leave no open exposure, wins, or losses
    And I see the available balance as "€100.00"

  Scenario: A cancelled standalone bet stays visible but is not a sequence
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I add a bet labeled "Standalone cancellation" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    When I mark the bet "Standalone cancellation" as "Cancelled"
    Then the cancelled bet "Standalone cancellation" should be visible outside sequences
    And I should see 0 sequences
    And the settled P&L should be "€0.00"
    And cancellation should leave no open exposure, wins, or losses
    And the goal target should be "€0.00"

  Scenario: Cancelling the latest sequence bet preserves recovery for continuation
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I set the goal rate to "100" with full recovery weighting
    And I add a bet labeled "Sequence loss" with odds "1.50" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Sequence loss" as "Lost"
    And I press the plus button for the sequence containing the bet "Sequence loss"
    Then I see the new bet dialog
    When I input the label "Cancelled recovery attempt"
    And I input the date and time "2026-09-13T13:00"
    And I input "1.50" in the odds field
    And I press the Add button
    And I mark the bet "Cancelled recovery attempt" as "Cancelled"
    Then the sequence containing the bet "Cancelled recovery attempt" should be "Active"
    And the settled P&L should be "-€1.00"
    And the plus button for the sequence containing the bet "Cancelled recovery attempt" should be visible
    When I press the plus button for the sequence containing the bet "Cancelled recovery attempt"
    Then I see the new bet dialog
    When I input "1.50" in the odds field
    And the suggested stake should be "€4.00"
    When I cancel the bet form
    And I reload the app
    Then the sequence containing the bet "Cancelled recovery attempt" should be "Active"
    And the plus button for the sequence containing the bet "Cancelled recovery attempt" should be visible

  Scenario: Correcting a loss to Cancelled reverses the loss and persists
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I add a bet labeled "Loss corrected to cancellation" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Loss corrected to cancellation" as "Lost"
    Then the settled P&L should be "-€1.00"
    When I mark the bet "Loss corrected to cancellation" as "Cancelled"
    Then the settled P&L should be "€0.00"
    And I see the available balance as "€100.00"
    When I reload the app
    Then the cancelled bet "Loss corrected to cancellation" should be visible outside sequences
    When I mark the bet "Loss corrected to cancellation" as "Lost"
    Then the settled P&L should be "-€1.00"
    And I should see 1 sequences

  Scenario: Correcting the only closing win to Cancelled reopens the sequence
    When I start a fresh ledger
    And I set the starting balance to "100"
    And I set the base stake to "1"
    And I add a bet labeled "Prior sequence loss" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Prior sequence loss" as "Lost"
    And I press the plus button for the sequence containing the bet "Prior sequence loss"
    Then I see the new bet dialog
    When I input the label "Closing win corrected"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I input "2" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Closing win corrected" as "Won"
    Then the sequence containing the bet "Closing win corrected" should be "Closed"
    When I mark the bet "Closing win corrected" as "Cancelled"
    Then the sequence containing the bet "Closing win corrected" should be "Active"
    And the settled P&L should be "-€1.00"
    And the goal target should be "€0.75"
    And the plus button for the sequence containing the bet "Closing win corrected" should be visible

  Scenario: A sequence containing only cancelled bets is not counted
    When I start a fresh ledger
    And I add a bet labeled "First cancelled bet" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "First cancelled bet" as "Lost"
    And I press the plus button for the sequence containing the bet "First cancelled bet"
    Then I see the new bet dialog
    When I input the label "Second cancelled bet"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I press the Add button
    And I mark the bet "First cancelled bet" as "Cancelled"
    And I mark the bet "Second cancelled bet" as "Cancelled"
    Then I should see 0 sequences
    And the cancelled bet "First cancelled bet" should be visible outside sequences
    And the cancelled bet "Second cancelled bet" should be visible outside sequences

  Scenario: An active sequence shows its Active tag below its number
    When I start a fresh ledger
    And I add a bet labeled "Tag first" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Tag first" as "Lost"
    And I press the plus button for the sequence containing the bet "Tag first"
    And I input the label "Tag second"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I input "1" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Tag second" as "Lost"
    Then the sequence card containing the bet "Tag first" should not show "In progress"
    And the Active tag of the sequence containing the bet "Tag first" should be directly below its number
  Scenario: Outcome buttons match the size of Edit and Delete and are nested
    When I start a fresh ledger
    And I add a bet labeled "Grouped open" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    Then the buttons "Won, Lost, Cancelled, Edit, Delete" in the card containing the bet "Grouped open" should have the same size
    And the buttons "Won, Lost, Cancelled" in the card containing the bet "Grouped open" should be nested without gaps

  Scenario: Sequence buttons match the size of Edit and Delete and are nested
    When I start a fresh ledger
    And I add a bet labeled "Grouped first" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    And I mark the bet "Grouped first" as "Lost"
    And I press the plus button for the sequence containing the bet "Grouped first"
    And I input the label "Grouped second"
    And I input the date and time "2026-09-13T13:00"
    And I input "2.00" in the odds field
    And I input "1" in the Manual Stake field
    And I press the Add button
    And I mark the bet "Grouped second" as "Lost"
    Then the buttons "Close sequence, Add bet to sequence 1, Delete" in the card containing the bet "Grouped first" should have the same size
    And the buttons "Close sequence, Add bet to sequence 1, Delete" in the card containing the bet "Grouped first" should be nested without gaps
  Scenario: Bet card action groups are aligned to opposite edges on mobile
    Given the viewport is a small phone
    When I start a fresh ledger
    And I add a bet labeled "Aligned open" with odds "2.00" and a manual stake of "1" placed at "2026-09-13T12:00"
    Then the "Won" button in the card containing the bet "Aligned open" should be at the left edge of the card
    And the "Delete" button in the card containing the bet "Aligned open" should be at the right edge of the card
  Scenario: The Add Bet button is flat
    When I navigate to the Sequences view
    Then the Add Bet button should have no drop shadow
    When I hover over the Add Bet button
    Then the Add Bet button should have no drop shadow
    And the Add Bet button should not be lifted