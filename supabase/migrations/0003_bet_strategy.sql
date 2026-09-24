-- Records the strategy values a bet was placed under, so that changing the
-- strategy later never re-prices bets that have already been placed.
-- Columns are nullable: rows written by earlier versions are stamped on read
-- from the settings stored on their parent ledger.

alter table public.bets
  add column if not exists base_stake numeric(12, 4),
  add column if not exists threshold numeric(12, 4),
  add column if not exists recovery_weight numeric(12, 4),
  add column if not exists stake_rounding numeric(12, 4),
  add column if not exists max_stake numeric(12, 4);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bets_base_stake_check'
  ) then
    alter table public.bets
      add constraint bets_base_stake_check
      check (base_stake is null or base_stake > 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'bets_threshold_check'
  ) then
    alter table public.bets
      add constraint bets_threshold_check
      check (threshold is null or threshold > 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'bets_recovery_weight_check'
  ) then
    alter table public.bets
      add constraint bets_recovery_weight_check
      check (recovery_weight is null or (recovery_weight >= 0 and recovery_weight <= 1));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'bets_stake_rounding_check'
  ) then
    alter table public.bets
      add constraint bets_stake_rounding_check
      check (stake_rounding is null or (stake_rounding >= 0 and stake_rounding <= 4));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'bets_max_stake_check'
  ) then
    alter table public.bets
      add constraint bets_max_stake_check
      check (max_stake is null or max_stake > 0);
  end if;
end;
$$;
