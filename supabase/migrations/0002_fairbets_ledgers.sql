do $$
begin
  if to_regclass('public.ledgers') is null and to_regclass('public.series') is not null then
    alter table public.series rename to ledgers;
  end if;

  if to_regclass('public.bets') is not null and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bets'
      and column_name = 'series_id'
  ) then
    alter table public.bets rename column series_id to ledger_id;
  end if;
end;
$$;

alter index if exists public.series_owner_updated_idx rename to ledgers_owner_updated_idx;
alter index if exists public.bets_series_placed_idx rename to bets_ledger_placed_idx;

drop trigger if exists set_series_updated_at on public.ledgers;
drop trigger if exists set_ledger_updated_at on public.ledgers;
create trigger set_ledger_updated_at
before update on public.ledgers
for each row
execute function public.set_updated_at();

drop policy if exists "Owners can manage their series" on public.ledgers;
drop policy if exists "Owners can manage their ledgers" on public.ledgers;
create policy "Owners can manage their ledgers"
on public.ledgers
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can manage their series bets" on public.bets;
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
