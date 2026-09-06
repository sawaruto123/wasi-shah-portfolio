-- Add optional logo image URL to profile settings.
update public.site_settings
set value = value || '{"logo_image":""}'::jsonb
where key = 'profile';
