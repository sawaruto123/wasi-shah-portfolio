-- Add editable portrait + footer role line to the profile settings.
update public.site_settings
set value = value || '{"portrait":"https://lh3.googleusercontent.com/aida-public/AB6AXuAU6O-XRWGTRWSCSR30EeBHCrgFk7TCES4izCwW6dMZcopNnylUJjPV1fAYX1-ZyTiqku_Q_pNMXFDnxspeBzBRQ_BGDm4LH4JtVT-GOtJUFvhnLh--MhZPxhCSfdx0iZ10Q_XmPEfXj2FnuuXAdsB8reWU0hV0xuPq2Lrsu01Zx-lKF3yhh08aYtNJRlxCNJmJQC3sYamlo0nvsXoGCHT85yc5a_ms-hmVxW9sktJp-fw3MlUyADhw","role_line":"HKMU BSc CS · ADOBE AMBASSADOR · CREATIVE DEVELOPER"}'::jsonb
where key = 'profile';
