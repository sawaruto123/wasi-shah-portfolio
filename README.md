# WASI SHAH / 峻山 — Digital World Portfolio

A Summer Wars–inspired, 3D spatial portfolio for Syed Wasi Shah (峻山) — filmmaker, motion designer, graphic designer and creative developer based in Hong Kong.

Now backed by **Supabase**: a database, admin CMS (`/admin`), and image storage — no code changes needed to publish content.

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS v4
- Three.js (custom WebGL corridor: internet planet, node constellation, DOF + bloom post-processing)
- lucide-react icons
- Supabase (Postgres + Auth + Storage + PostgREST REST API)

## Structure

```
src/
  App.tsx                 # room routing, scroll travel, loading screen
  data.ts                 # fallback/seed content + default settings
  types.ts                # shared types
  index.css               # theme tokens + animations
  lib/
    supabase.ts           # Supabase client (env-driven)
    content.tsx           # ContentProvider + useContent() hook
  admin/                  # CMS (lazy-loaded at /admin)
    AdminApp.tsx          # auth + tab shell
    ProjectsManager.tsx   # CRUD projects
    FilmsManager.tsx      # CRUD films
    StillsManager.tsx     # CRUD stills
    EngagementsManager.tsx# CRUD commercial engagements
    SettingsManager.tsx   # profile / hero / about / contact / experience / skills
    fields.tsx            # shared form UI + image upload
  components/
    SpatialCanvas.tsx     # 3D world (WebGL)
    ...                   # room components (now read via useContent())
supabase/
  migrations/             # SQL schema + seed (applied via scripts/run-sql.ps1)
scripts/
  run-sql.ps1             # runs SQL against the linked project via the Management API
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build → dist/
npm run lint     # typecheck
```

Environment (`.env.local`, already created; `.env.example` is the template):

```
VITE_SUPABASE_URL=https://nkjvfhzfyfdybtynrzxa.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

## Admin CMS

- URL: **https://your-site.vercel.app/admin** (or `http://localhost:3000/admin`)
- Sign in with your admin email/password (see `.supabase-admin-password.txt` locally — change it after first login).
- Public sign-ups are **disabled**, so only the pre-created admin account can log in.
- Manage: Projects, Films, Stills, Commercial engagements, and all site text (profile, hero, about, contact, experience, skills, languages).
- Images upload directly to Supabase Storage (public `images` bucket).

## Database & migrations

The database is **Supabase Postgres** (project `nkjvfhzfyfdybtynrzxa`, region ap-southeast-1).

Since Docker isn't required, migrations are applied via the Management API:

```powershell
# Run a single migration file
powershell -File scripts/run-sql.ps1 -File supabase/migrations/20260906000001_init.sql

# Or an inline query
powershell -File scripts/run-sql.ps1 -Sql "select * from projects"
```

This reads your Supabase access token from Windows Credential Manager (set up by `supabase login`).

### Security (Row Level Security)

- **Public (anon)**: can read published content only.
- **Authenticated (admin)**: full read/write on all tables.
- **Storage**: anyone can read the `images` bucket; only the admin can upload/delete.

## Deploy (GitHub + Vercel)

1. Push this repo to GitHub.
2. In Vercel: **Add New Project → Import** the repo (Vercel auto-detects Vite).
3. Add these environment variables in Vercel (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. The `vercel.json` rewrite already handles the `/admin` SPA route.

Supabase itself is already live and needs no further setup for production.
