-- Portfolio World: multiple screenshots + full architecture write-up.
update public.projects set
  image = '/images/pw-hero.png',
  images = array['/images/pw-hero.png','/images/pw-archive.png','/images/pw-lab.png','/images/pw-admin.png'],
  image_ratios = array['16:9','16:9','16:9','16:9'],
  image_positions = array['center','center','center','center'],
  detailed_description = E'HOW IT IS BUILT\n- Frontend: a React + Vite single-page app. Five "rooms" (World / Lab / Archive / Films / Connect) are fixed overlays that swap as you scroll; the scrollbar drives a virtual camera through the 3D scene.\n- 3D world: raw Three.js / WebGL - a raymarched black hole (accretion disk + gravitational lensing shader), planets, a nebula sky shader, drifting rocks, and mouse/tap ripples, finished with bloom.\n- Data: Supabase Postgres (projects, films, stills, photo events, engagements, settings, messages). Row-Level Security makes writes admin-only and reads public.\n- CMS (/admin): a headless admin with a tab per collection - create/edit/delete, image and video upload, drag-to-crop, and per-image ratio + focus.\n- Media: uploads go through a Vercel serverless function that verifies the admin session, then stores in ImageKit (free CDN) and serves resize + WebP/AVIF on the fly.\n- Ops: Vercel hosting, CSP + HSTS security headers, weekly Postgres backups via GitHub Actions, and a built-in client error log.'
where id = 'portfolio-world';

-- More detail for the other projects (how each is built).
update public.projects set detailed_description = E'HOW IT IS BUILT\n- Electron desktop app (Vite + JavaScript) with a floating, always-on-top window.\n- MediaPipe Face Landmarker runs in the renderer for real-time landmark tracking.\n- A canvas overlay maps expressions onto an avatar; the window is captured in OBS with no browser tab.' where id = 'face-overlay';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Pure PowerShell, shipped as a Flipper Zero BadUSB payload.\n- Runs a themed cleanup routine (temp files, caches, logs) with a cyberpunk terminal aesthetic.\n- No dependencies - drop it on a target machine and run.' where id = 'flipper-winsweep';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Built in Godot with GDScript: scenes for the player controller, levels, collectibles and UI.\n- Exported to HTML5 and published on itch.io so it plays in the browser.' where id = 'gold-finder';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Windows PowerShell 5.1 + WPF always-on-top widget.\n- Scans the Obsidian vault markdown for frontmatter tasks and open checkboxes.\n- Groups by area and note, with filters, sorting and write-back when you tick a box.\n- A startup installer and a watchdog keep it running.' where id = 'obsidian-tasks';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- React 19 + TypeScript + Vite + Tailwind, two apps (user + admin) on a single Supabase backend.\n- Postgres with Row-Level Security; two Edge Functions (admin via secret key, delete-account via JWT).\n- Onboarding computes Hong Kong MPF; expense categorisation auto-deducts the daily allowance.\n- Bilingual (Traditional Chinese / English) with avatar upload and cropping.' where id = 'cash-app';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- A Firefox WebExtension written in JavaScript.\n- Forked from LYiHub open-source Card-Master; adds a collectible card-game layer to the browser.\n- Packaged and signed for Firefox distribution.' where id = 'card-master';
