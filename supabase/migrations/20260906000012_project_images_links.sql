-- Projects: multiple images + links
alter table public.projects
  add column if not exists images text[],
  add column if not exists github_url text,
  add column if not exists website_url text;

update public.projects
  set images = array[image]
  where (images is null or cardinality(images) = 0)
    and image is not null and image <> '';
