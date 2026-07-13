-- ============================================================
-- The Great Pet-Off: Team Pistachio vs Team Leo
-- Paste this whole file into: Supabase dashboard -> SQL Editor -> Run
-- (No secrets to edit this time. Safe to run more than once.)
-- ============================================================

create table if not exists public.cat_pets (
  cat   text primary key check (cat in ('pistachio', 'leo')),
  count bigint not null default 0
);

alter table public.cat_pets enable row level security;

insert into public.cat_pets (cat) values ('pistachio'), ('leo')
on conflict (cat) do nothing;

-- Add pets to a cat (batched from the site, 1 to 50 per call).
-- Returns the new global total for that cat.
create or replace function public.pet_cat(p_cat text, p_count int)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare new_count bigint;
begin
  if p_cat not in ('pistachio', 'leo') then
    raise exception 'invalid cat';
  end if;
  if p_count is null or p_count < 1 or p_count > 50 then
    raise exception 'invalid count';
  end if;
  update cat_pets set count = count + p_count where cat = p_cat
  returning count into new_count;
  return new_count;
end;
$$;

-- Current standings for both cats.
create or replace function public.pet_counts()
returns table (cat text, count bigint)
language sql stable security definer set search_path = public
as $$
  select c.cat, c.count from cat_pets c;
$$;
