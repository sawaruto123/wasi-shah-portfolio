-- Contact form submissions.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  scope text not null default 'motion',
  details text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone may submit a message (insert only, no read/update/delete).
create policy "messages_public_insert"
  on public.messages for insert with check (true);

-- Only the authenticated admin may read / update / delete messages.
create policy "messages_admin_select"
  on public.messages for select to authenticated using (true);
create policy "messages_admin_update"
  on public.messages for update to authenticated using (true);
create policy "messages_admin_delete"
  on public.messages for delete to authenticated using (true);
