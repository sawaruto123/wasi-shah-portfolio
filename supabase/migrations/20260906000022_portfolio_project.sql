-- Add this portfolio website itself as a project
insert into public.projects
  (id, exp_number, title, category, category_badge, tag, extra_badge, image, images, image_ratios, image_positions, col_span, description, detailed_description, tech, github_url, website_url, published, sort_order)
values
  ('portfolio-world', '11', 'Portfolio World', 'code', 'Web · 3D', 'Space-themed 3D portfolio with a Supabase CMS', 'React', '/images/portfolio-world.png', array['/images/portfolio-world.png'], array['auto'], array['center'], '8', 'A space-themed 3D portfolio: a scroll-driven Three.js world with an interactive black hole, planets and nebula, backed by a headless Supabase CMS. Content, media and settings are all managed from the /admin panel.', E'- Scroll-driven Three.js world: black hole, planets, nebula, and interactive ripples\n- Headless Supabase CMS (Postgres + Auth + RLS) for projects, films, photos and settings\n- Media served from ImageKit (free CDN) with on-the-fly resize and WebP/AVIF\n- Security: CSP + HSTS, authenticated upload endpoint, rate-limited contact form\n- Automated weekly Postgres backups and a built-in client error log', array['React','Three.js','Tailwind','Supabase','Vite','Vercel'], 'https://github.com/sawaruto123/wasi-shah-portfolio', 'https://wasi-shah-portfolio.vercel.app', true, 8)
on conflict (id) do update set
  exp_number = excluded.exp_number,
  title = excluded.title,
  category = excluded.category,
  category_badge = excluded.category_badge,
  tag = excluded.tag,
  extra_badge = excluded.extra_badge,
  image = excluded.image,
  images = excluded.images,
  image_ratios = excluded.image_ratios,
  image_positions = excluded.image_positions,
  col_span = excluded.col_span,
  description = excluded.description,
  detailed_description = excluded.detailed_description,
  tech = excluded.tech,
  github_url = excluded.github_url,
  website_url = excluded.website_url,
  published = excluded.published,
  sort_order = excluded.sort_order;
