Feature: Cloud sync

  Background:
    Given the app is configured for Supabase cloud sync

  Scenario: Sync the local ledger to cloud storage
    Given the user is signed in to Supabase cloud sync
    And a cloud ledger is linked to the account
    When the ledger changes
    Then the app should queue and save the latest state to the cloud
    And it should update the cloud sync status to synced

  Scenario: Restore the latest cloud ledger
    Given the user is signed in and has a saved cloud ledger
    When the user chooses to restore from the cloud
    Then the app should load the most recent saved ledger
    And it should replace the local ledger
    And it should confirm the restore with a success message

  Scenario: Request and complete cloud sign-in
    Given the user is not signed in to cloud sync
    When the user enters a valid email and requests a sign-in link
    Then the app should send a magic-link request
    And it should ask the user to check email for authentication

  Scenario: Disconnect cloud sync
    Given the user is signed in to cloud sync
    When the user signs out
    Then the app should clear the active cloud session
    And the app should no longer attempt automatic cloud sync
