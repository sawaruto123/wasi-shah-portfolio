-- Add optional favicon URL to profile settings.
update public.site_settings
set value = value || '{"favicon":""}'::jsonb
where key = 'profile';
