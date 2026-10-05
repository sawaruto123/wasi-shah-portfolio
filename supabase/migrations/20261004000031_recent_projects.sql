
-- Remove the old Cash entry (superseded), then add three recent projects.
-- Backup: supabase/backups/projects-before-2026-10-04.json

DELETE FROM projects WHERE id = 'cash-app';

INSERT INTO projects (
  id, exp_number, title, category, category_badge, tag, image, images,
  col_span, description, detailed_description, tech, published, sort_order, website_url
) VALUES (
  'vai-academy-os',
  '07',
  'VAI Academy OS',
  'code',
  'Business Operations',
  'Class, billing and payroll system for a tutoring academy',
  '/images/vai-01.webp',
  ARRAY['/images/vai-01.webp','/images/vai-02.webp','/images/vai-03.webp','/images/vai-04.webp','/images/vai-05.webp','/images/vai-06.webp'],
  '8',
  'An operations system for a tutoring academy that replaces a Google Apps Script tool with a real web application: classes, attendance, debit notes, FPS payment reconciliation, payroll and profit reporting in one place, across four roles.',
  'THE PROBLEM
The previous system was a Google Apps Script app on a Sheets backend. In the owner''s words it was "worse than a spreadsheet": form-only logging, and tab-switching hid each student''s record.

WHAT IT DOES
- Four fixed roles (Teacher, Admin, Financial, CEO) with a permission matrix; one user can hold several.
- Two ways to log a class: a form, and a Markdown/AI paste path.
- A unified student view - classes, attendance, invoices, payments and balance on one page, no tabs.
- Scheduling that auto-creates classes from a recurring timetable; every generated class stays editable.
- Debit notes rendered as PDFs, FPS payment reconciliation, teacher pay, monthly payroll runs and P&L reports.
- An audit log recording who changed what, for every money-affecting change.

ARCHITECTURE
```
Browser (single-page app)
        |
        v
Cloudflare Worker  --->  Cloudflare D1 (SQLite)
        |
        +---> KV (nightly backups, cron)
```',
  ARRAY['Cloudflare Workers','Cloudflare D1','JavaScript','jsPDF'],
  true,
  6,
  NULL
);

INSERT INTO projects (
  id, exp_number, title, category, category_badge, tag, image, images,
  col_span, description, detailed_description, tech, published, sort_order, website_url
) VALUES (
  'an-xin',
  '08',
  'An Xin (安心)',
  'code',
  'Android · Kotlin',
  'Elderly-care companion app with a caregiver console',
  '/images/anxin-01.webp',
  ARRAY['/images/anxin-01.webp','/images/anxin-02.webp','/images/anxin-03.webp','/images/anxin-04.webp'],
  '4',
  'A bilingual elderly-care companion app shipped as a single APK with two roles: a simplified elder home screen and a caregiver console, sharing one backend.',
  'HOW IT IS BUILT
- Kotlin + Jetpack Compose, one codebase, Material 3.
- Firebase Auth, Firestore, Storage and Cloud Messaging for pairing, alerts and photo capture.
- osmdroid for offline-capable maps, so there is no Google Maps dependency.
- Cellular auto-dial fallback: the elder never depends on an in-app calling feature.
- Bilingual Traditional Chinese / English, with honest "unknown" states instead of guessed values.

WHY THE DETAILS MATTER
An elder''s phone is often the only device they use. Each screen was reduced to one primary action, and everything complicated lives on the caregiver side.',
  ARRAY['Kotlin','Jetpack Compose','Firebase','osmdroid'],
  true,
  7,
  'https://anxin-c092a.web.app'
);

INSERT INTO projects (
  id, exp_number, title, category, category_badge, tag, image, images,
  col_span, description, detailed_description, tech, published, sort_order, website_url
) VALUES (
  'personal-ops-suite',
  '09',
  'Personal Ops Suite',
  'code',
  'Windows Automation',
  'Always-on desktop tools for a personal knowledge vault',
  '/images/ops-suite.svg',
  ARRAY['/images/ops-suite.svg'],
  '4',
  'A family of always-on Windows tools that keep a personal knowledge vault running: a task widget, a call-session logger, an attendance logger, a power monitor and an expense tracker, all sharing one visual theme.',
  '- PowerShell 5.1 + WPF, each tool packaged with a .cmd launcher.
- One shared theme module (light surfaces, slate greys, violet accent) reused everywhere.
- Google Sheets API sync for the call list, with a CSV fallback when offline.
- Single-instance mutexes, live polling, and settings-driven filters.',
  ARRAY['PowerShell','WPF','Python','Google Sheets API'],
  true,
  8,
  NULL
);
