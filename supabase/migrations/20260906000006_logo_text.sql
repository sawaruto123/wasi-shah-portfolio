-- Add editable logo monogram text to profile settings.
update public.site_settings
set value = value || '{"logo_text":"WS"}'::jsonb
where key = 'profile';
