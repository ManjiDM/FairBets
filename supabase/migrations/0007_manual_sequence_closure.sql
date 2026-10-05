alter table public.bets
  add column if not exists sequence_manually_closed boolean not null default false;
