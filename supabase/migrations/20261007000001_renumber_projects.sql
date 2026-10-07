-- Renumber the project cards into a contiguous sequence.
--
-- The gallery renders #{expNumber} on every card (RoomGallery.tsx, Modals.tsx), so a missing
-- number is visible: the archive read 01, 02, 04, 05, 06, 07, 08, 09. The gap is where
-- Obsidian Tasks sat before it was removed for having no publishable artefacts, and it was
-- never closed.
--
-- sort_order carried the same hole (0, 1, 3, 4, ...), because both columns were assigned from
-- the same deleted row. Both move down by one so the numbering and the ordering agree.
--
-- exp_number has no unique constraint — the projects table has only projects_pkey on (id) —
-- so the updates can run in any order. They are still written ascending for legibility.

begin;

update projects set exp_number = '03', sort_order = 2 where id = 'card-master';
update projects set exp_number = '04', sort_order = 3 where id = 'face-overlay';
update projects set exp_number = '05', sort_order = 4 where id = 'vai-academy-os';
update projects set exp_number = '06', sort_order = 5 where id = 'an-xin';
update projects set exp_number = '07', sort_order = 6 where id = 'personal-ops-suite';
update projects set exp_number = '08', sort_order = 7 where id = 'tribeonone';

commit;
