-- Longer, organized descriptions for all projects
update public.projects set
  description = 'Real-time facial expression overlay for streaming, built as a standalone Electron app on MediaPipe Face Landmarker. Drop in a webcam, drive an avatar with your face, and capture the floating window in OBS.',
  detailed_description = E'- No dev server or browser tab, just a floating always-on-top window\n- Real-time facial landmark tracking powered by MediaPipe\n- Built for VTubers and streamers who want expression-driven overlays\n- Packaged as a standalone Electron desktop app'
where id = 'face-overlay';

update public.projects set
  description = 'A cyberpunk-themed Windows cleanup utility for Flipper Zero BadUSB and PowerShell. Trigger it from a BadUSB payload to run a quick, themed system sweep on a target machine.',
  detailed_description = E'- One-shot Windows cleanup routine with a cyberpunk terminal aesthetic\n- Designed to run from Flipper Zero BadUSB payloads\n- Pure PowerShell with no dependencies\n- Safe, reversible cleanup targets like temp files, caches, and logs'
where id = 'flipper-winsweep';

update public.projects set
  description = 'A small 2D platformer PC game built with the Godot engine. Run, jump, and collect gold across hand-built levels, playable right in the browser.',
  detailed_description = E'- Built entirely in Godot with GDScript\n- Classic platformer mechanics: running, jumping, collecting\n- Exported to HTML5 so it runs in any browser\n- Published and playable on itch.io'
where id = 'gold-finder';

update public.projects set
  description = 'A Windows PowerShell 5.1 + WPF always-on-top task widget that turns an Obsidian vault into a live task dashboard. It scans markdown notes, reads frontmatter and checkboxes, and groups everything by area.',
  detailed_description = E'- Scans every markdown note for tasks and open checkboxes\n- Groups by area with colored headers, then by note, with company pills (VAI / ACW)\n- Filters: Today / Week / Month / All, plus sorting by due, priority, title, project, company\n- Overdue tasks turn red, due-today amber, priorities get colored chips\n- Click a checkbox to complete it, and it writes straight back into the note file\n- Runs from Windows startup with installer, watchdog, and tray minimize'
where id = 'obsidian-tasks';

update public.projects set
  description = 'A Windows PowerShell 5.1 + WPF personal expense logger with both a GUI and a CLI. It writes to a plain markdown file, no database, and computes a monthly summary using an auto-spend model.',
  detailed_description = E'- GUI (WPF) for quick entry, CLI for scripting and automation\n- Data lives in one markdown file with Salary / Extras / Fixed payments per month\n- Auto-spend model: set weekday and weekend rates plus a food budget\n- Monthly summary = income minus auto food/transport minus logged extras minus fixed payments\n- Headless modes (Summary / Add / SmokeTest) run anywhere'
where id = 'expense-tracker';

update public.projects set
  description = 'A personal finance system with a user-facing app and a separate developer admin console, sharing one Supabase backend. Built with React 19, TypeScript, and Tailwind, with a bilingual UI.',
  detailed_description = E'- User app: income/expense logging with category auto-deduction, summary, bills, debts, history, notices, and session tracking\n- Onboarding: 6 steps covering daily spending, weekend budget, multi-job income with Hong Kong MPF calculation, bills, and profile\n- Admin console: secret-key login, user management, transactions, analytics, and targeted or batch notices\n- Backend: Supabase Postgres (6 tables, RLS) plus two edge functions (admin, delete-account)\n- Bilingual (Traditional Chinese / English), with avatar upload and built-in cropping'
where id = 'cash-app';

update public.projects set
  description = 'A Firefox browser extension card game, forked from the open-source Card-Master extension by LYiHub. It adds a collectible card-game layer to the browser.',
  detailed_description = E'- Forked from the original open-source repository by LYiHub\n- Built as a Firefox WebExtension in JavaScript\n- Includes Breath of the Wild themed card assets\n- Packaged and signed for Firefox distribution'
where id = 'card-master';

update public.projects set
  description = 'A collection of security demos and pentesting reports, with hands-on vulnerability demonstrations and write-ups.',
  detailed_description = E'- Clickjacking demonstrations (two variants) showing UI-redressing attacks\n- Return-map data-leak report documenting a real exposure\n- Scripts that generate formatted reports\n- Focused on practical, reproducible security concepts'
where id = 'codex';
