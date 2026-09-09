-- Videos: storage bucket + video field on films & projects
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

alter table public.films add column if not exists video text;
alter table public.projects add column if not exists video text;
