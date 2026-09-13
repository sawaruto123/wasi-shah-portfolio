-- Replace the seeded placeholder commercial engagements with real client work.
--
-- The original seed (20260906000002_seed.sql) inserted three invented clients
-- (TribeOnOne / PixelCap / Viral Reels), which read as unverifiable client
-- claims on a live portfolio. These are the actual engagements, framed by what
-- was delivered rather than by job title, so this list complements the
-- experience timeline on the Lab page instead of repeating it.

delete from public.engagements
where id in ('tribeonone', 'pixelcap', 'viral-reels');

insert into public.engagements (id, category, client, description, sort_order) values
  (
    'behance-adobe-ambassador',
    'Adobe Creative Community',
    'Behance Co Limited',
    'Live YouTube streams, workshops, and an After Effects course for the Adobe creative community.',
    0
  ),
  (
    'vai-marketing-teacher',
    'Education & Marketing',
    'Virtual Academy International',
    'Campaigns, print collateral, and an internal debit-note billing system.',
    1
  ),
  (
    'moji-creative-apac',
    'Creative Agency · APAC',
    'moji Corporation Limited',
    'Campaign concepts, video and photo editing for APAC clients.',
    2
  ),
  (
    'seaman-paper-graphic',
    'Print & Packaging',
    'Seaman Paper Asia',
    'Production artwork and day-to-day marketing collateral.',
    3
  )
on conflict (id) do update set
  category = excluded.category,
  client = excluded.client,
  description = excluded.description,
  sort_order = excluded.sort_order;
