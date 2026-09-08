-- Projects: per-image crop position (focal point)
alter table public.projects add column if not exists image_positions text[];
