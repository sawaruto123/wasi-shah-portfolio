-- =============================================================
-- WASI SHAH / 峻山 — Digital World Portfolio · CMS schema
-- =============================================================

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------
-- Projects (Archive)
-- -------------------------------------------------------------
create table if not exists public.projects (
  id text primary key,
  exp_number text not null default '',
  title text not null default '',
  category text not null default 'code',
  category_badge text not null default '',
  tag text not null default '',
  extra_badge text,
  image text not null default '',
  col_span text not null default '4',
  description text not null default '',
  detailed_description text,
  tech text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Films (Cinema)
-- -------------------------------------------------------------
create table if not exists public.films (
  id text primary key,
  title text not null default '',
  release_year text not null default '',
  duration text not null default '',
  badge text not null default '',
  image text not null default '',
  description text not null default '',
  credits_role text not null default '',
  format text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger films_set_updated_at
before update on public.films
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Stills (Photography)
-- -------------------------------------------------------------
create table if not exists public.stills (
  id text primary key,
  title text not null default '',
  focal_length text not null default '',
  image text not null default '',
  accent_color text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stills_set_updated_at
before update on public.stills
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Commercial engagements
-- -------------------------------------------------------------
create table if not exists public.engagements (
  id text primary key,
  category text not null default '',
  client text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger engagements_set_updated_at
before update on public.engagements
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Site settings (key -> jsonb)
-- -------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- =============================================================
-- Row Level Security
-- Public (anon) can READ published content only.
-- Authenticated users (the admin) can READ + WRITE everything.
-- (Public sign-ups are disabled, so "authenticated" == the admin.)
-- =============================================================

alter table public.projects enable row level security;
create policy "projects_public_read_published"
  on public.projects for select using (published = true);
create policy "projects_admin_all"
  on public.projects for all to authenticated using (true) with check (true);

alter table public.films enable row level security;
create policy "films_public_read_published"
  on public.films for select using (published = true);
create policy "films_admin_all"
  on public.films for all to authenticated using (true) with check (true);

alter table public.stills enable row level security;
create policy "stills_public_read_published"
  on public.stills for select using (published = true);
create policy "stills_admin_all"
  on public.stills for all to authenticated using (true) with check (true);

alter table public.engagements enable row level security;
create policy "engagements_public_read"
  on public.engagements for select using (true);
create policy "engagements_admin_all"
  on public.engagements for all to authenticated using (true) with check (true);

alter table public.site_settings enable row level security;
create policy "settings_public_read"
  on public.site_settings for select using (true);
create policy "settings_admin_all"
  on public.site_settings for all to authenticated using (true) with check (true);

-- =============================================================
-- Storage: public "images" bucket
-- Anyone can read; only the authenticated admin can upload/edit.
-- =============================================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "images_public_read"
  on storage.objects for select using (bucket_id = 'images');
create policy "images_admin_insert"
  on storage.objects for insert to authenticated with check (bucket_id = 'images');
create policy "images_admin_update"
  on storage.objects for update to authenticated using (bucket_id = 'images');
create policy "images_admin_delete"
  on storage.objects for delete to authenticated using (bucket_id = 'images');
