-- Replace DSA Practice with Gold Finder (itch.io Godot game)
delete from public.projects where id in ('dsa-practice', 'gold-finder');

insert into public.projects
  (id, exp_number, title, category, category_badge, tag, extra_badge, image, col_span, description, tech, github_url, website_url, published, sort_order)
values
  ('gold-finder', '05', 'Gold Finder', 'code', 'Godot', 'A small 2D platformer PC game', 'Godot', '/images/gold-finder.png', '4', 'A small 2D platformer PC game I made with the Godot engine. Play it in your browser on itch.io.', array['Godot','GDScript'], null, 'https://hodrshah.itch.io/gold-finder', true, 4);
