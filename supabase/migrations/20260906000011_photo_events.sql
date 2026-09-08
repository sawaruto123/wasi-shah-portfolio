-- Photo events (event photography collections) + stills.event_id link
create table if not exists public.photo_events (
  id text primary key,
  title text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger photo_events_set_updated_at
before update on public.photo_events
for each row execute function public.set_updated_at();

alter table public.photo_events enable row level security;
create policy "public read photo_events" on public.photo_events for select using (true);
create policy "auth write photo_events" on public.photo_events for all to authenticated using (true) with check (true);

alter table public.stills add column if not exists event_id text;
