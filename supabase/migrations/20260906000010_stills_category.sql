-- Photography: add category (daily vs event) + before/after image support
alter table public.stills
  add column if not exists category text not null default 'daily',
  add column if not exists before_image text;
