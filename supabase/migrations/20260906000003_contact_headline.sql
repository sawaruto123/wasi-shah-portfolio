-- Add editable headline/subtext to the contact settings row.
update public.site_settings
set value = value || '{"headline":"Let''s build something unforgettable.","subtext":"Accepting select commissions in Hong Kong and worldwide."}'::jsonb
where key = 'contact';
