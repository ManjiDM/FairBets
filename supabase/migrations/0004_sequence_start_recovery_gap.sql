alter table public.bets
  add column if not exists sequence_start_recovery_gap numeric(12, 4);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bets_sequence_start_recovery_gap_check'
  ) then
    alter table public.bets
      add constraint bets_sequence_start_recovery_gap_check
      check (
        sequence_start_recovery_gap is null or sequence_start_recovery_gap >= 0
      );
  end if;
end;
$$;
