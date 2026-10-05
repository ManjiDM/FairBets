alter table public.bets
  drop constraint if exists bets_outcome_check;

alter table public.bets
  add constraint bets_outcome_check
  check (outcome in ('open', 'won', 'lost', 'cancelled'));
