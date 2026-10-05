-- Reinstate TribeOnOne, and add it to the project archive.
--
-- 20260910000028 removed TribeOnOne together with two genuinely invented clients
-- (PixelCap / Viral Reels). TribeOnOne is not one of those: the site is live at
-- https://www.tribeonone.com and the scope is recorded in the user's own notes
-- (Website/syed_wasi_shah_portfolio.md -> Web Design, Community Infrastructure,
-- Telegram Bot). Only TribeOnOne is restored here. PixelCap and Viral Reels stay
-- deleted until someone can evidence them.
--
-- The screenshots are captures of the live site with the sticky navigation cropped
-- off; nothing on the page is private, it is the client's own public marketing copy.

insert into public.engagements (id, category, client, description, sort_order) values
  (
    'tribeonone',
    'Web & Community',
    'TribeOnOne',
    'Landing site, brand identity and a Telegram bot for a global electric unicycle community.',
    4
  )
on conflict (id) do update set
  category = excluded.category,
  client = excluded.client,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.projects (
  id, exp_number, title, category, category_badge, tag,
  image, images, image_captions, col_span,
  description, detailed_description, tech,
  website_url, published, sort_order
) values (
  'tribeonone',
  '09',
  'TribeOnOne',
  'code',
  'Web / Community',
  'Community hub, brand and Telegram bot for a global EUC community',
  '/images/tribe-01.webp',
  array[
    '/images/tribe-01.webp',
    '/images/tribe-02.webp',
    '/images/tribe-03.webp',
    '/images/tribe-04.webp'
  ],
  array[
    'Hero - Ride. Know. Belong.',
    'What the community is, and the three layers it offers',
    'The Vault - the members layer behind an email capture',
    'Alex''s Corner - a second editorial voice for the brand'
  ],
  '4',
  'TribeOnOne is a community hub for electric unicycle riders - a global audience with a strong UK base. I built the landing site, the community infrastructure behind it and the brand identity, so the organisers can publish and grow without a developer in the loop.',
  'THE BRIEF
EUC riders were scattered across forum threads and group chats. The community existed and was growing, but it had no front door - nowhere to send a new rider, and no way for the organisers to publish anything without hand-editing a page.

WHAT IT DELIVERS
- A landing site: one responsive page that explains the community, who it is for, and how to join.
- The Hub: a live Telegram community, with a custom bot that posts updates into the group.
- The Vault: a members-only layer behind an email capture, holding the technical guides and the fortnightly dispatch.
- Alex''s Corner: a second editorial voice, so the brand reads as people rather than a product page.
- Brand identity: logo, colour system, type, and the social templates the community posts with.

HOW IT WAS BUILT
Odoo, configured rather than written from scratch, with custom HTML and CSS where the layout needed it and a Python bot for the Telegram side.

That was the point of the choice: the site has to survive without me. The organisers edit their own pages, publish their own posts and manage their own list - no ticket to a developer for every change.

WHAT IS LIVE
The public site, the members capture, and the Telegram group the bot posts into, all running at tribeonone.com.',
  array['Odoo CMS', 'HTML/CSS', 'Python', 'Telegram Bot'],
  'https://www.tribeonone.com',
  true,
  8
)
on conflict (id) do update set
  exp_number = excluded.exp_number,
  title = excluded.title,
  category = excluded.category,
  category_badge = excluded.category_badge,
  tag = excluded.tag,
  image = excluded.image,
  images = excluded.images,
  image_captions = excluded.image_captions,
  col_span = excluded.col_span,
  description = excluded.description,
  detailed_description = excluded.detailed_description,
  tech = excluded.tech,
  website_url = excluded.website_url,
  published = excluded.published,
  sort_order = excluded.sort_order;
