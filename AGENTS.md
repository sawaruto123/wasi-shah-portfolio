# AGENTS.md — portfolio-v3

Portfolio site for **WASI SHAH / 峻山** — space-themed 3D world (React + Three.js + Tailwind v4 + Vite) with a Supabase backend + CMS at `/admin`. Deployed to Vercel via GitHub (`sawaruto123/wasi-shah-portfolio`).

## Commands

```powershell
npm run dev        # dev server → http://localhost:3000 (Start-Process node node_modules/vite/bin/vite.js --port 3000 --host 127.0.0.1)
npm run build      # production build (must exit 0 before pushing)
```

## Deploy flow

1. `npm run build` (verify BUILD EXIT: 0)
2. `git add -A && git commit -m "..." && git push`
3. Vercel auto-deploys on push (~30–60s). Tell the user to hard-refresh.

**Gotcha:** `git push` to GitHub frequently fails with a network error ("Failed to connect to github.com:443"); just retry the push until it succeeds. Use `$env:Path = "C:\Program Files\Git\cmd;$env:Path"` before git in PowerShell.

## Supabase

- URL + anon key in `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The project ref is the subdomain of `VITE_SUPABASE_URL` (and is hardcoded in `scripts/run-sql.ps1`).
- **Run SQL migrations:** `powershell -File scripts/run-sql.ps1 -File supabase/migrations/<file>.sql` (Management API + Windows Credential Manager token "Supabase CLI:supabase").
- RLS: public can read published rows; only authenticated (admin) can write. The admin account credentials are deliberately **not** in this repo — keep them in your local password manager.
- Content is fetched with `Cache-Control: no-cache` (see `src/lib/supabase.ts` + `content.tsx`) because PostgREST responses lack cache headers.

## Key files

- `src/App.tsx` — rooms, scroll/navigation, modal state, loading screen
- `src/components/` — `RoomNexus/Studio/Gallery/Cinema/Dispatch`, `SpatialCanvas` (Three.js world), `Modals`, `SmartImage`, `BeforeAfter`, `AsciiPortrait`, `OnboardingGuide`, `ErrorBoundary`
- `src/lib/` — `content.tsx` (Supabase + fallback), `supabase.ts`, `theme.tsx`, `image.ts` (`thumbUrl`), `bgOpacity.tsx`
- `src/admin/` — CMS managers (Projects, Films, Stills, Photo Events, Engagements, Settings, Messages)
- `supabase/migrations/` — schema + seeds
- `vercel.json` — CSP + security headers
- `api/og-image.js` — dynamic OG image (Vercel function)

## Conventions

- **Theme:** space world (dark) is the default "light" mode; night mode is darker (`.dark` class). Night mode is manual-toggle only (NOT auto OS dark — see `public/theme-init.js`).
- **Images:** always use `thumbUrl(url, w, h?)` (`src/lib/image.ts`) — Supabase image transformation + Google size params — never raw full-size images in cards.
- Tailwind v4 (`@import "tailwindcss"` in `src/index.css`); custom CSS at the bottom of that file.
- Comments in Chinese are fine; keep the existing bilingual style.

## Useful helpers (in `scripts/`)

- `web.mjs` — Firecrawl search/scrape: `node scripts/web.mjs search <q>` | `scrape <url>` (key in `.firecrawl-key`)
- `run-sql.ps1` — run migrations against Supabase
- `setup-imagekit.ps1` — one-time ImageKit media-pipeline setup wizard
- `perf.mjs` — real-Chrome (CDP) profiler: measures frame times, the main-thread breakdown, and a CPU profile while scrolling a room. `node scripts/perf.mjs <url> <roomIndex>` (room 3 = Films).
