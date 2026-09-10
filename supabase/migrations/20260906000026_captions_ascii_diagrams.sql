-- Per-image captions + pure-ASCII diagrams (box-drawing glyphs fall back to a
-- mismatched font because Google Fonts subsets JetBrains Mono).

alter table public.projects add column if not exists image_captions text[];

update public.projects set
  image_captions = array[
    'Landing - the scroll-driven 3D space world',
    'Archive - the project grid over the black hole',
    'Lab - the interactive ASCII portrait + skills',
    'CMS backend - the /admin dashboard'
  ],
  detailed_description = E'HOW IT IS BUILT\n- Frontend: React + Vite SPA; five rooms swap as the scrollbar drives a virtual camera.\n- 3D world: raw Three.js / WebGL - a raymarched black hole, planets, nebula sky, ripples, bloom.\n- Data: Supabase Postgres; Row-Level Security makes writes admin-only and reads public.\n- CMS (/admin): a tab per collection - create / edit / delete, upload, drag-to-crop, ratio + focus.\n- Media: uploads pass a Vercel function that checks the admin session, then land in ImageKit CDN.\n- Ops: CSP + HSTS, weekly Postgres backups, and a built-in client error log.\n\nARCHITECTURE\nBrowser (React + Three.js)\n   |  content (anon key)\n   v\nSupabase  ( Postgres . Auth . RLS )\n   ^\n   |  admin writes + media upload\n   |\nVercel (/api/upload)  --->  ImageKit CDN  --->  images'
where id = 'portfolio-world';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- React 19 + TypeScript + Vite + Tailwind; two apps (user + admin) on one Supabase backend.\n- Postgres with Row-Level Security; two Edge Functions (admin via secret key, delete-account via JWT).\n- Onboarding computes Hong Kong MPF; expense categorisation auto-deducts the daily allowance.\n- Bilingual (Traditional Chinese / English) with avatar upload and cropping.\n\nARCHITECTURE\nUser App (React + TS)\n   |  anon key\n   v\nSupabase  ( Postgres . RLS . Auth )\n   ^\n   |  x-admin-secret\n   |\nAdmin Console  --->  admin Edge Function (service_role)'
where id = 'cash-app';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Electron desktop app (Vite + JavaScript) with a floating, always-on-top window.\n- MediaPipe Face Landmarker runs in the renderer for real-time landmark tracking.\n- A canvas overlay maps expressions onto an avatar; the window is captured in OBS.\n\nPIPELINE\nWebcam\n   |  frames\n   v\nMediaPipe Face Landmarker\n   |  landmarks\n   v\nAvatar overlay (canvas)  --->  OBS capture'
where id = 'face-overlay';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Built in Godot with GDScript: scenes for the player controller, levels, collectibles and UI.\n- Exported to HTML5 and published on itch.io so it plays in the browser.\n\nGAME LOOP\nPlayer input\n   |  input events\n   v\nGodot runtime (GDScript)  --  physics . collision . tiles\n   |\n   v\nHTML5 export  --->  itch.io'
where id = 'gold-finder';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Windows PowerShell 5.1 + WPF always-on-top widget.\n- Scans the Obsidian vault markdown for frontmatter tasks and open checkboxes.\n- Groups by area and note, with filters, sorting and write-back when you tick a box.\n- A startup installer and a watchdog keep it running.\n\nDATA FLOW\nObsidian vault ( markdown . frontmatter . checkboxes )\n   |  scan\n   v\nPowerShell engine  --  group . filter . sort\n   |  WPF\n   v\nAlways-on-top widget\n   |  tick a box\n   v\nwrite-back to the note file'
where id = 'obsidian-tasks';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Pure PowerShell, shipped as a Flipper Zero BadUSB payload.\n- Runs a themed cleanup routine (temp files, caches, logs) with a cyberpunk terminal aesthetic.\n- No dependencies - drop it on a target machine and run.\n\nFLOW\nFlipper Zero  --BadUSB-->  PowerShell payload\n   |\n   v\nstaged cleanup ( temp . cache . logs )\n   |\n   v\ncyberpunk terminal output'
where id = 'flipper-winsweep';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- A Firefox WebExtension written in JavaScript.\n- Forked from LYiHub open-source Card-Master; adds a collectible card-game layer to the browser.\n- Packaged and signed for Firefox distribution.\n\nSTRUCTURE\nFirefox extension\n   +-- content script  --->  card-game layer on the page\n   +-- popup UI\n   +-- BOTW card assets ( bundled )'
where id = 'card-master';
