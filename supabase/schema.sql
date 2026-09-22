create extension if not exists pgcrypto;
create table if not exists public.ledgers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 60),
  settings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bets (
  id text primary key,
  ledger_id uuid not null references public.ledgers (id) on delete cascade,
  placed_at timestamp without time zone not null,
  label text not null check (char_length(label) between 1 and 60),
  odds numeric(12, 4) not null check (odds > 1),
  outcome text not null check (outcome in ('open', 'won', 'lost')),
  stake_override numeric(12, 4) check (stake_override is null or stake_override > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ledgers_owner_updated_idx
  on public.ledgers (owner_id, updated_at desc);

create index if not exists bets_ledger_placed_idx
  on public.bets (ledger_id, placed_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ledger_updated_at on public.ledgers;
create trigger set_ledger_updated_at
before update on public.ledgers
for each row
execute function public.set_updated_at();

drop trigger if exists set_bets_updated_at on public.bets;
create trigger set_bets_updated_at
before update on public.bets
for each row
execute function public.set_updated_at();

alter table public.ledgers enable row level security;
alter table public.bets enable row level security;

drop policy if exists "Owners can manage their ledgers" on public.ledgers;
create policy "Owners can manage their ledgers"
on public.ledgers
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can manage their ledger bets" on public.bets;
create policy "Owners can manage their ledger bets"
on public.bets
for all
to authenticated
using (
  exists (
    select 1
    from public.ledgers as owned_ledger
    where owned_ledger.id = bets.ledger_id
      and owned_ledger.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.ledgers as owned_ledger
    where owned_ledger.id = bets.ledger_id
      and owned_ledger.owner_id = auth.uid()
  )
);
