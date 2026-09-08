-- Projects: per-image crop ratio (parallel to images)
alter table public.projects add column if not exists image_ratios text[];
