-- ============================================================
-- moussaandhanin.com — RSVP backend
-- Paste this whole file into: Supabase dashboard → SQL Editor → Run
--
-- ⚠️ ONE THING TO EDIT before running: the secret on the last line.
--    Make it long and random — it's the password for /guests.html.
-- ============================================================

create table if not exists public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  name_key   text generated always as (lower(btrim(name))) stored,
  status     text not null check (status in ('yes','plus_one','maybe','no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name_key)
);

create table if not exists public.settings (
  key   text primary key,
  value text not null
);

-- Lock both tables down completely: RLS on, zero policies.
-- The ONLY way in is through the three functions below.
alter table public.rsvps    enable row level security;
alter table public.settings enable row level security;

-- Save or update an answer (same name = update, so people can change their mind)
create or replace function public.submit_rsvp(p_name text, p_status text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if btrim(coalesce(p_name, '')) = '' or length(btrim(p_name)) > 60 then
    raise exception 'invalid name';
  end if;
  if p_status not in ('yes', 'plus_one', 'maybe', 'no') then
    raise exception 'invalid status';
  end if;
  insert into rsvps (name, status)
  values (btrim(p_name), p_status)
  on conflict (name_key)
  do update set status = excluded.status, name = excluded.name, updated_at = now();
end;
$$;

-- Public headcount for the "N people are celebrating" counter (yes = 1, +1 = 2)
create or replace function public.celebrating_count()
returns integer
language sql stable security definer set search_path = public
as $$
  select coalesce(sum(case status when 'yes' then 1 when 'plus_one' then 2 else 0 end), 0)::int
  from rsvps;
$$;

-- Full guest list — only with the secret key
create or replace function public.guest_list(p_key text)
returns table (name text, status text, updated_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (select 1 from settings s where s.key = 'guest_list_key' and s.value = p_key) then
    raise exception 'not allowed';
  end if;
  return query
    select r.name, r.status, r.updated_at
    from rsvps r
    order by r.updated_at desc;
end;
$$;

-- ⚠️ EDIT THIS before running: replace CHANGE-ME with your own long random secret.
insert into public.settings (key, value)
values ('guest_list_key', 'CHANGE-ME')
on conflict (key) do update set value = excluded.value;
