-- Client error log: captures runtime errors so they aren't lost to the console.
create table if not exists public.client_errors (
  id bigint generated always as identity primary key,
  message text not null default '',
  stack text,
  url text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.client_errors enable row level security;

-- Anyone (even signed-out visitors) may log an error.
drop policy if exists "anyone can log errors" on public.client_errors;
create policy "anyone can log errors"
  on public.client_errors for insert
  with check (true);

-- Only the authenticated admin can read them.
drop policy if exists "admin can read errors" on public.client_errors;
create policy "admin can read errors"
  on public.client_errors for select
  to authenticated
  using (true);
