# WASI SHAH / 峻山 — Digital World Portfolio

A space-themed 3D portfolio for **Syed Wasi Shah (峻山)** — filmmaker, motion designer, graphic designer and creative developer based in Hong Kong.

Instead of a scrolling page, you **travel through a WebGL universe**. Five rooms sit at different depths along a corridor; scrolling flies the camera between them. All content is editable from a CMS at `/admin` — no code changes needed to publish.

Built to run entirely on **free, card-free tiers**: Vercel (hosting + serverless) + Supabase (database, auth, storage) + ImageKit (media CDN) + YouTube-nocookie (long video).

---

## Rooms

| # | Room | Route | What's there |
|---|------|-------|--------------|
| 01 | **WORLD** | `room-nexus` | Hero, black hole, planets, world stats, "Enter World" |
| 02 | **LAB** | `room-studio` | About, ASCII duotone portrait, experience timeline, skills, languages |
| 03 | **ARCHIVE** | `room-gallery` | Project cards → full detail modals (images, "how it's built" diagrams, links) |
| 04 | **FILMS** | `room-cinema` | Short films + video, commercial work, Daily and Event photography |
| 05 | **CONNECT** | `room-dispatch` | Contact form, socials, details |

Navigation: scroll, the `←`/`→` side arrows, the top nav, or the mobile bottom bar. A spotlight **guided tour** (`OnboardingGuide`) runs on first visit and flies you to each room while highlighting the real controls.

---

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** (`@import "tailwindcss"` in `src/index.css`)
- **Three.js** — hand-built WebGL world: black hole with accretion disk, planets, particle field, node constellation, `UnrealBloomPass` post-processing
- **Supabase** — Postgres + Auth + Storage + PostgREST
- **ImageKit** — on-the-fly image/video transforms and delivery
- **lucide-react** icons
- **Vercel** — static hosting + two serverless functions

---

## Features

**Site / UX**
- Scroll-to-travel 3D corridor; rooms cross-fade + glitch in as you arrive
- Two themes: **space world** (default "light") and a deeper **night mode** — manual toggle only, never follows the OS (`public/theme-init.js`)
- **Background opacity** slider (default **25%**) to push the world back behind the text
- Mouse-drag ambient light dial; click anywhere in the world to send a ripple
- Full-screen **image lightbox** (portal to `document.body`, prev/next, keyboard, counter)
- **Before/after** comparison sliders for retouched photography
- Fully responsive, with a mobile bottom nav and swipe gestures
- Loading screen, cookie banner, privacy policy, error boundary, 404

**Content**
- **Projects** — multi-image galleries, per-image crop ratio + 9-point focal position, per-image captions, optional video, GitHub/website links, and a `ProjectDetails` renderer supporting headings, `◆` bullets and fenced ```` ``` ```` code blocks (used for ASCII architecture diagrams)
- **Films** — posters plus YouTube-nocookie / Vimeo / self-hosted video
- **Photography** — Daily stills and Event stills grouped by photo event, with optional before/after pairs
- **Commercial** engagements list
- Contact form → `submit_message` RPC with rate limiting (3 / 10 min / email) and a honeypot

**Admin CMS** (`/admin`, lazy-loaded)
- Auth-gated; public sign-ups disabled
- CRUD for Projects, Films, Stills, Photo Events, Engagements, Messages, Settings
- Drag-crop image tool, multi-upload, video upload
- **Errors** tab reading client-side error reports

**Operations**
- Client error observability (`client_errors` + `src/lib/errorLog.ts`)
- Weekly `pg_dump` backup workflow (version-matched `postgres:17` client) → 90-day GitHub artifact
- SEO: JSON-LD, canonical, `robots.txt`, `llms.txt`, dynamic OG image via `api/og-image.js`
- Security headers in `vercel.json` (CSP with `frame-src`/`media-src`, HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy)

---

## Project structure

```
api/
  upload.js               # serverless media upload → ImageKit (requires admin JWT)
  og-image.js             # serverless dynamic OG image
src/
  App.tsx                 # rooms, scroll travel, modal state, loading screen
  data.ts                 # ROOMS + fallback/seed content + default settings
  index.css               # Tailwind + theme tokens + custom CSS
  components/
    SpatialCanvas.tsx     # the 3D world (WebGL)
    RoomNexus|Studio|Gallery|Cinema|Dispatch.tsx
    Modals.tsx            # project / film / still modals
    ImageLightbox.tsx  SmartImage.tsx  BeforeAfter.tsx  AsciiPortrait.tsx
    ProjectDetails.tsx  VideoPlayer.tsx  OnboardingGuide.tsx
    NavigationHUD.tsx  CookieConsent.tsx  PrivacyPolicy.tsx
    ErrorBoundary.tsx  Toast.tsx  NotFound.tsx
  lib/
    supabase.ts           # client (env-driven, no-cache fetches)
    content.tsx           # ContentProvider + useContent()
    image.ts              # thumbUrl() / tinyUrl() — ImageKit + Supabase transforms
    prefetch.ts           # idle-time image prefetch + pre-decode
    useImageTone.ts       # cached, idle-time average-brightness sampling
    theme.tsx  bgOpacity.tsx  video.ts  aspect.ts  errorLog.ts
  admin/                  # CMS (lazy chunk)
    AdminApp.tsx  Projects|Films|Stills|PhotoEvents|Engagements|Settings|Messages|ErrorsManager.tsx
    fields.tsx  cropper.tsx  helpers.ts  useCollection.ts
supabase/migrations/      # schema + seeds (0001 → current)
scripts/                  # local tooling (see below)
vercel.json               # security headers
```

---

## Run locally

```bash
npm install
npm run dev      # → http://localhost:3000
npm run build    # production build → dist/
npm run preview  # serve the production build
npm run lint     # tsc --noEmit (typecheck only)
```

### Environment

Copy `.env.example` → `.env.local` and fill in:

| Variable | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | client | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | client | safe to expose — RLS protects writes |
| `IMAGEKIT_URL_ENDPOINT` | client | e.g. `https://ik.imagekit.io/<id>` |
| `IMAGEKIT_PUBLIC_KEY` | client | |
| `IMAGEKIT_PRIVATE_KEY` | **server only** | used by `api/upload.js`; set in Vercel, never in client code |
| `IMAGEKIT_FOLDER` | server | upload folder, e.g. `portfolio` |

`scripts/setup-imagekit.ps1` walks through capturing the ImageKit keys into `.env.local`.

---

## Media pipeline (ImageKit)

Uploads go **browser → `/api/upload` → ImageKit**; the function verifies the caller's Supabase session before accepting anything, so the private key never reaches the client.

`src/lib/image.ts` centralises delivery:

- `thumbUrl(url, w, h?)` — sized/optimised image for cards and grids
- `tinyUrl(url, w = 24)` — a few-hundred-byte version used for instant blurred placeholders

Cards request **small** thumbnails; the **full-resolution** image is only downloaded when the lightbox opens.

---

## Database & migrations

Supabase Postgres. Migrations are applied through the Management API (no Docker needed):

```powershell
powershell -File scripts/run-sql.ps1 -File supabase/migrations/20260906000001_init.sql
powershell -File scripts/run-sql.ps1 -Sql "select id, title from projects"
```

The script reads your Supabase access token from Windows Credential Manager (set up via `supabase login`).

### Row Level Security

- **anon** — read published rows only
- **authenticated (admin)** — full read/write
- **storage** — public read; admin-only write
- `client_errors` — public insert, admin read

The admin account is created manually in the Supabase dashboard. Keep its credentials in a password manager — they are deliberately **not** committed to this repo.

---

## Performance notes

The site is a permanently-animating WebGL scene plus image-heavy grids, so scrolling was profiled hard with real Chrome (`scripts/perf.mjs`, CDP + V8 CPU profiles). Things that mattered:

| Technique | Why |
|---|---|
| **Idle prefetch + `img.decode()`** | Downloads *and* decodes the next room's images off the critical path. Decoding on first paint was ~1.7s of native work. |
| **LQIP blurred placeholders** | A tiny 24px version paints instantly, so cards never flash empty. |
| **Size tiers** | Grid thumbs are small; full resolution only on click. |
| **`content-visibility: auto`** on photo cards | Off-screen cards skip layout, paint and image loading. |
| **Cached + staggered tone sampling** | `getImageData` is a synchronous readback; batching 7 of them blocked the thread for ~1.3s. Now cached per URL and run one-at-a-time in idle. |
| **3D world yields the GPU while scrolling** | Bloom is disabled and rendering drops to half-rate during scroll, then restores. |
| **No full-screen blend modes / `background-attachment: fixed`** | Both force a viewport-wide repaint or re-blend every frame. |
| **rAF-throttled scroll + no React state on scroll** | The Z readout writes to a DOM ref, so scrolling causes zero re-renders. |
| **3D pixel ratio capped at 1.5×** | Bloom is the single most expensive GPU pass. |

Re-measure any time with:

```bash
node scripts/perf.mjs http://localhost:4173/ 3   # 3 = Films room
```

It reloads per scenario so you measure the **first** scroll a real visitor feels, and prints frame times, a main-thread breakdown (script / style / layout) and a CPU profile.

---

## Deploy (GitHub + Vercel)

1. Push to GitHub.
2. Vercel → **Add New Project → Import** the repo (auto-detects Vite).
3. Add environment variables (Project → Settings → Environment Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_FOLDER`.
4. Deploy. `vercel.json` handles the `/admin` SPA rewrite, security headers and function config.

Every push to `main` triggers an automatic redeploy (~30–60s).

### Backups

`.github/workflows/db-backup.yml` runs a weekly `pg_dump` (plus a manual trigger) and stores it as a 90-day artifact. It needs one repository secret: `SUPABASE_DB_PASSWORD`.

---

## Scripts

| Script | Purpose |
|---|---|
| `scripts/run-sql.ps1` | Run a migration file or inline SQL against Supabase |
| `scripts/setup-imagekit.ps1` | One-time wizard to capture ImageKit keys into `.env.local` |
| `scripts/perf.mjs` | Real-Chrome (CDP) scroll profiler |
| `scripts/web.mjs` | Firecrawl web search / scrape helper (key in `.firecrawl-key`) |
