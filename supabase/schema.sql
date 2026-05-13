-- ============================================================
-- Personal Closet — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- TABLES ----------

create table if not exists public.items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  category        text not null,
  subcategory     text default '',
  color           jsonb default '[]'::jsonb,   -- array of hex strings
  brand           text default '',
  material        text default '',
  season          jsonb default '[]'::jsonb,
  occasion        jsonb default '[]'::jsonb,
  size            text default '',
  price           numeric default 0,
  purchase_date   date,
  tags            jsonb default '[]'::jsonb,
  notes           text default '',
  image_path      text default '',             -- path in closet-images bucket
  status          text default 'active',
  wear_count      integer default 0,
  last_worn_date  date,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists items_user_id_idx     on public.items (user_id);
create index if not exists items_category_idx    on public.items (user_id, category);
create index if not exists items_status_idx      on public.items (user_id, status);
create index if not exists items_created_at_idx  on public.items (user_id, created_at desc);

create table if not exists public.outfits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  item_ids     jsonb default '[]'::jsonb,   -- array of item uuids
  occasion     text default '',
  season       text default '',
  notes        text default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists outfits_user_id_idx     on public.outfits (user_id);
create index if not exists outfits_created_at_idx  on public.outfits (user_id, created_at desc);

create table if not exists public.wear_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  item_ids    jsonb default '[]'::jsonb,
  outfit_id   uuid,
  notes       text default '',
  created_at  timestamptz default now()
);

create index if not exists wear_logs_user_id_idx  on public.wear_logs (user_id);
create index if not exists wear_logs_date_idx     on public.wear_logs (user_id, date desc);

-- ---------- updated_at trigger ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_items_updated_at on public.items;
create trigger trg_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

drop trigger if exists trg_outfits_updated_at on public.outfits;
create trigger trg_outfits_updated_at
before update on public.outfits
for each row execute function public.set_updated_at();

-- ---------- ROW LEVEL SECURITY ----------

alter table public.items     enable row level security;
alter table public.outfits   enable row level security;
alter table public.wear_logs enable row level security;

-- items
drop policy if exists "items_select_own" on public.items;
create policy "items_select_own" on public.items
  for select using (auth.uid() = user_id);

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items
  for insert with check (auth.uid() = user_id);

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items
  for update using (auth.uid() = user_id);

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items
  for delete using (auth.uid() = user_id);

-- outfits
drop policy if exists "outfits_select_own" on public.outfits;
create policy "outfits_select_own" on public.outfits
  for select using (auth.uid() = user_id);

drop policy if exists "outfits_insert_own" on public.outfits;
create policy "outfits_insert_own" on public.outfits
  for insert with check (auth.uid() = user_id);

drop policy if exists "outfits_update_own" on public.outfits;
create policy "outfits_update_own" on public.outfits
  for update using (auth.uid() = user_id);

drop policy if exists "outfits_delete_own" on public.outfits;
create policy "outfits_delete_own" on public.outfits
  for delete using (auth.uid() = user_id);

-- wear_logs
drop policy if exists "wear_logs_select_own" on public.wear_logs;
create policy "wear_logs_select_own" on public.wear_logs
  for select using (auth.uid() = user_id);

drop policy if exists "wear_logs_insert_own" on public.wear_logs;
create policy "wear_logs_insert_own" on public.wear_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "wear_logs_delete_own" on public.wear_logs;
create policy "wear_logs_delete_own" on public.wear_logs
  for delete using (auth.uid() = user_id);

-- ---------- RPC: bump wear count atomically ----------

create or replace function public.increment_wear_for_items(
  p_item_ids uuid[],
  p_date     date
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.items
    set wear_count     = coalesce(wear_count, 0) + 1,
        last_worn_date = greatest(coalesce(last_worn_date, p_date), p_date),
        updated_at     = now()
  where id = any(p_item_ids)
    and user_id = auth.uid();
end;
$$;

grant execute on function public.increment_wear_for_items(uuid[], date) to authenticated;

-- ---------- STORAGE: closet-images bucket ----------
-- (Create the bucket in Dashboard → Storage → New bucket named "closet-images",
--  toggle "Public bucket" ON, then run the policies below.)

-- Read: anyone can read images (public bucket; paths use UUIDs so guessing is hard)
drop policy if exists "closet-images read" on storage.objects;
create policy "closet-images read"
  on storage.objects for select
  using (bucket_id = 'closet-images');

-- Insert/update/delete: only authenticated users, only into their own folder.
-- Object names must look like: <user_id>/<file.jpg>
drop policy if exists "closet-images insert own" on storage.objects;
create policy "closet-images insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'closet-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "closet-images update own" on storage.objects;
create policy "closet-images update own"
  on storage.objects for update
  using (
    bucket_id = 'closet-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "closet-images delete own" on storage.objects;
create policy "closet-images delete own"
  on storage.objects for delete
  using (
    bucket_id = 'closet-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
