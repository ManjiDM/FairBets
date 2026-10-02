do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bets'
      and column_name = 'label_is_automatic'
  ) then
    alter table public.bets
      add column label_is_automatic boolean not null default false;

    update public.bets
    set label_is_automatic = true
    where label ~* '^Selection [0-9]+$';
  end if;
end;
$$;
