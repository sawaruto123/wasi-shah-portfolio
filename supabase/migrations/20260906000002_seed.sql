-- =============================================================
-- Seed data — mirrors src/data.ts so the CMS starts populated
-- =============================================================

-- Projects ----------------------------------------------------
insert into public.projects (id, exp_number, title, category, category_badge, tag, extra_badge, image, col_span, description, detailed_description, tech, sort_order) values
('face-overlay-tool', '01', 'Face Overlay Tool', 'ai', 'AI / Computer Vision', 'AI · COMPUTER VISION', 'Live Pipeline', '/images/work-01.jpg', '8', 'Real-time biometric alignment and generative facial synthesis tool. Employs lightweight Python OpenCV routines and neural landmark meshes to composite dynamic identity disguises.', 'Engineered for sub-15ms inference latencies on consumer-grade hardware. Utilizes 468-point 3D face mesh tracking, optical flow stabilization, and custom latent texture warping shaders for live theatrical video performances.', array['Python','OpenCV','MediaPipe','PyTorch']::text[], 0),
('ai-financial-advisor', '02', 'AI Financial Advisor', 'ai', 'Agentic FinTech', 'AI · AGENTIC', null, '/images/work-02.jpg', '4', 'Multi-agent autonomous wealth planning framework built on CrewAI. Orchestrates macroeconomic sentiment crawlers with personal portfolio stress tests.', 'Decoupled into autonomous analyst, auditor, and portfolio rebalancing roles. Employs tool-augmented LLMs with vector memory backends to simulate macroeconomic downturns and optimize capital allocation.', array['CrewAI','LLM Tooling','FastAPI']::text[], 1),
('3d-business-card', '03', '3D Business Card', 'code', 'WebGL / Three.js', 'WEBGL · 3D', null, '/images/work-03.jpg', '4', 'Interactive kinetic digital identity card with realistic accelerometer tilt physics, dynamic roughness map shaders, and bilingual typography.', 'Rendered with custom PBR surface shaders, dynamic iridescence calculations, and real-time device orientation handling to create a tactile holographic calling card.', array['Three.js','GLSL','Kinetic Type']::text[], 2),
('gold-finder', '04', 'Gold Finder', 'fintech', 'Trading Analytics', 'FINANCE · DATA', null, '/images/work-04.jpg', '4', 'Algorithmic precious metals tracker scanning market spreads, spot rates, and momentum deviations with automated trade trigger notifications.', 'Aggregates multi-exchange WebSocket feeds, calculating Bollinger band squeezes and liquidity depth differentials with zero downtime failover routing.', array['Python','Pandas','WebSockets']::text[], 3),
('debit-note-log', '05', 'Debit Note & Log', 'fintech', 'FinTech Engine', 'FINANCE · TOOL', null, '/images/work-05.jpg', '4', 'Automated PDF ledger generator and transaction tracker designed for precise corporate transaction audits and invoice dispersal.', 'Generates pixel-perfect vectorized debit memos and tax compliance receipts with digital signatures, cryptographic hashes, and automatic ERP integration.', array['FastAPI','PostgreSQL','ReportLab']::text[], 4),
('vibe-code', '06', 'Vibe Code', 'code', 'Audio Visualizer', 'AUDIO · WEBGL', null, '/images/work-06.jpg', '4', 'Real-time WebGL shader tool synthesizing FFT audio frequencies into fluid geometry and particle turbulence synchronized to sound waves.', 'Direct Web Audio frequency analysis mapped to simplex noise deformation, generating synchronized fluid particle fields and reactive audio bloom.', array['Web Audio API','Canvas','GLSL']::text[], 5),
('cash-app', '07', 'Cash', 'fintech', 'Personal Finance', 'FINANCE · APP', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbEZ1ccKVNIbJ6ke2hHTyoV9bridXZDcVkJcP8m4Otubt6OFutXSZuiiztskuW7zmXUw3Hl3mrKvaS_2BwWb4Rr2-Cp_Dn4MVjCZFRfrva9b6QBJbWvgkPd-kLUTkUnG90vQOO6JawFEWaW0yLI5NaDzbNZoe36ip-sltjOTFsRioUUaKz3jIDiIP21icidyW-wXFozh3gklam0eCAW1N4CdVOxPrY2ceBILUKXjVTt4nfq2rGXIT-', '4', 'A full-stack personal finance tracker with a daily auto-spend model, exception logging, recurring bills, debt tracking, and usage analytics.', 'Built with React, TypeScript and a Supabase backend (Postgres + Auth + Row-Level Security), with a bilingual UI, onboarding wizard, and an admin console.', array['React','TypeScript','Supabase','Tailwind']::text[], 6),
('obsidian-tasks', '08', 'Obsidian Tasks', 'code', 'Productivity', 'TOOL · PRODUCTIVITY', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVY23BAzs5U_yGQywZBBnzWUUMNv4K___c3tsnYASeh8xVhBVpUyfuSvDEUuyjUAsGlshQUflxnQKz9C-mN8JsD6KwD9aGf-6d9BBstIhcYPZJqt3qIaxCj370fBBKdZtN3B5EssjrdxTVlYfXA_XaHr-qzMVdbEIQ4vpdCju3Zo9ebhQMnRKLllKmIx7f7mptnSA5kNmJ213grafphNQVe5hUM1IPEsVSV8rk_wj1bUB5OmzZ1qip', '4', 'An always-on-top task widget for Obsidian that surfaces task notes and open checkboxes, grouped by area and company.', 'Built with Windows PowerShell and WPF, featuring a single-instance mutex, live polling, and settings-driven filter and sort controls.', array['PowerShell','WPF','Obsidian']::text[], 7)
on conflict (id) do nothing;

-- Films -------------------------------------------------------
insert into public.films (id, title, release_year, duration, badge, image, description, credits_role, format, sort_order) values
('after-work', 'After Work', '2024 RELEASE', 'Short Film · 8m 42s', 'Official Selection', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkPnpq73OJLtIHzD29OYi1i8vdR28vA8roPIaQTs23nRrgbPyXqf8XuHd4_eMP3Vc6WLhORG26jQawhKNwpIYhJbcVfeMNKKYrDuBFEv7e7lptL1GzM97Ju-n5EKwWDnx-GEI2_FsPt68Kw9xK44t-EDGMD764ygpEla0yK8o4KNfvoZA807H3oFHb42kJOxKPcBTcfrqLxSI7nRAwC4vpRbkHz5XK0tn12X0zRifOJ7LsSUgUaS_g', 'A neon-drenched Hong Kong night thriller exploring corporate exhaustion and nocturnal rebirth beneath the overpasses of Kowloon.', 'Directed & Graded by Wasi Shah', 'Blackmagic RAW', 0),
('locked-in', 'Locked In', '2023 RELEASE', 'Short Film · 12m 15s', 'Festival Premiere', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnAfVFmNLZl4aAtvMgM6qaELSL3prBpCpqenCafeM_uQ_XksqfXutHlyKdhmh_I3f2UPrErZhTVkRpI8_idPyIl9Moo8Nyl1Z1nj4SuUh-BiT2kL9SIZ0TvUj4nw4hjUQvB7M4JFFZrt3pdvdDSimLedI1Egzqj8QBazC3_ors5NAG6stWDX_Cxa7-WxmacRQnNsxhn0lHoKb0o054WuPlUT4Tj3uKXndu7hC_Zl7LPKQ__81gDK-8', 'High-tension psychological narrative on creative isolation, obsessive flow state, and the breakdown between sensory reality and synthetic memory.', 'Cinematography & VFX by Wasi Shah', 'Spatial Audio', 1)
on conflict (id) do nothing;

-- Stills ------------------------------------------------------
insert into public.stills (id, title, focal_length, image, accent_color, sort_order) values
('merc-studio', 'Mercedes-Benz Studio', '16mm', '/images/photo-01.jpg', '#0047ff', 0),
('city-plaza', 'City Plaza — Woman in Grid', '35mm', '/images/photo-02.jpg', null, 1),
('macao-granny', 'Macao Granny', '50mm', '/images/photo-03.jpg', '#ff6b35', 2),
('ocean-park', 'Ocean Park Streetsnap', '35mm', '/images/photo-04.jpg', null, 3),
('central-granny', 'Central Granny', '50mm', '/images/photo-05.jpg', '#ff6b35', 4),
('dingding', 'DingDing Handle', '24mm', '/images/photo-06.jpg', null, 5),
('classroom', 'Classroom', '35mm', '/images/photo-07.jpg', null, 6),
('building-hole', 'Building with a Hole', '24mm', '/images/photo-08.jpg', '#ffb800', 7),
('worker', 'Worker', '85mm', '/images/photo-09.jpg', '#ffb800', 8),
('dancing-light', 'Dancing with Light', '35mm', '/images/photo-10.jpg', null, 9),
('vibe-bw', 'Vibe', '50mm', '/images/photo-11.jpg', null, 10),
('composition-bw', 'Composition', '35mm', '/images/photo-12.jpg', '#0047ff', 11)
on conflict (id) do nothing;

-- Commercial engagements --------------------------------------
insert into public.engagements (id, category, client, description, sort_order) values
('tribeonone', 'Decentralized Web3', 'TribeOnOne', 'Brand system re-architecture and motion launch collateral for crypto protocols.', 0),
('pixelcap', 'Venture Capital', 'PixelCap', 'Complete corporate identity, keynote pitch design, and media portal.', 1),
('viral-reels', 'High-Velocity Motion', 'Viral Reels (40M+ Imp)', 'Kinetic video reels and retention editing frameworks across YouTube and TikTok.', 2)
on conflict (id) do nothing;

-- Site settings -----------------------------------------------
insert into public.site_settings (key, value) values
('profile', '{"name":"Syed Wasi Shah","name_cn":"峻山","tagline":"Creating stories for the digital world.","location":"Hong Kong SAR"}'::jsonb),
('contact', '{"email":"syedwasi983@gmail.com","phone":"+852 9899 2944","whatsapp":"85298992944","location":"Hong Kong SAR · HKT (UTC+8)","socials":[{"name":"GitHub","url":"https://github.com"},{"name":"LinkedIn","url":"https://linkedin.com"},{"name":"Vimeo","url":"https://vimeo.com"},{"name":"Instagram","url":"https://instagram.com"}]}'::jsonb),
('hero', '{"title":"WASI SHAH","chinese":"峻山","subtitle":"Creating stories for the digital world."}'::jsonb),
('about', '{"headline":"Motion, design & code.","bio_1":"I''m a video editor, motion designer and graphic designer based in Hong Kong — also studying Computer Science at Hong Kong Metropolitan University (HKMU). I cut films, design brand systems, and build interactive tools.","bio_2":"Daily tools: Premiere Pro, After Effects, Photoshop and Illustrator for film & brand work — plus Python, Blender and AI workflows (ComfyUI, CrewAI) for interactive projects."}'::jsonb),
('stats', '{"projects":"50+","films":"20+","tools":"30+","location":"HK"}'::jsonb),
('experience', '[{"role":"Adobe Ambassador","company":"Behance Co","date":"2025 – Now","desc":"Representation, workshops, events & content creation."},{"role":"Marketing & Teacher","company":"Virtual Academy International","date":"2024 – Now","desc":"Campaigns, social media & online lessons."},{"role":"Creative Intern (APAC)","company":"moji Corporation","date":"2024 – 2025","desc":"Design concepts, video & photo editing for campaigns."},{"role":"Graphic Trainee","company":"Seaman Paper Asia","date":"2024","desc":"Day-to-day graphic design & marketing support."}]'::jsonb),
('skills', '["Premiere","After Effects","Photoshop","Illustrator","Python","Blender","ComfyUI","CrewAI"]'::jsonb),
('languages', '[{"name":"Cantonese (粵語)","level":"Native","pct":100},{"name":"English","level":"Native / Fluent","pct":96},{"name":"Mandarin (普通話)","level":"Fluent","pct":85}]'::jsonb)
on conflict (key) do nothing;
