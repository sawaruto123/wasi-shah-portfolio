# HANDOFF — How to update the WASI SHAH / 峻山 portfolio

This document tells an AI agent (or a new engineer) everything needed to safely
make changes to this site. Read it before editing. It captures the architecture,
the content model, and the hard-won gotchas that cost hours the first time.

---

## 1. What this is

A space-themed 3D portfolio for **Syed Wasi Shah (峻山)** — filmmaker, motion
designer, graphic designer, creative developer, Hong Kong. You *travel* through
a WebGL universe; five rooms sit at depths along a corridor and scrolling flies
the camera between them.

- **Repo:** `sawaruto123/wasi-shah-portfolio`
- **Live:** `https://wasi-shah-portfolio.vercel.app/`
- **CMS:** `https://wasi-shah-portfolio.vercel.app/admin`
- **Stack:** React 19 + TypeScript + Vite 6 + Tailwind v4 + Three.js, Supabase (Postgres/Auth/Storage) + ImageKit (media CDN), Vercel hosting.

Everything runs on free, card-free tiers: Vercel + Supabase + ImageKit + YouTube-nocookie embeds.

---

## 2. Commands (run from repo root)

```powershell
npm run dev      # → http://localhost:3000
npm run build    # production build (MUST exit 0 before pushing)
npm run preview  # serve the built output locally (better for perf testing)
npm run lint     # tsc --noEmit typecheck (MUST be clean)
```

**Deploy = `git push` to `main`.** Vercel auto-deploys in ~30–60s. No manual step.

**Windows gotcha:** `git push` intermittently fails with a network error
("Failed to connect to github.com:443"). Just retry. If git isn't on the path in
PowerShell, prefix: `$env:Path = "C:\Program Files\Git\cmd;$env:Path"`.

**Run SQL migrations** (no Docker needed — uses the Supabase Management API + a
token in Windows Credential Manager, entry "Supabase CLI:supabase"):

```powershell
powershell -File scripts/run-sql.ps1 -File supabase/migrations/<file>.sql
```

---

## 3. Architecture

```
api/
  og-image.js       # Vercel fn: dynamic Open Graph image
  upload-auth.js    # Vercel fn: issues short-lived ImageKit upload signature (admin JWT required)
  upload.js         # Vercel fn: fallback server-proxy upload (≤4.5 MB)
src/
  App.tsx           # rooms, scroll-to-travel navigation, modal state, loading screen
  data.ts           # ROOMS + fallback/seed content (used only if Supabase unreachable)
  index.css         # Tailwind import + theme tokens + custom CSS
  main.tsx          # mounts app + global error hooks
  components/
    SpatialCanvas.tsx      # the 3D world (WebGL: black hole, planets, particles, bloom)
    RoomNexus.tsx          # 01 World
    RoomStudio.tsx         # 02 Lab (about, ASCII portrait, experience, skills, languages, certs)
    RoomGallery.tsx        # 03 Archive (project cards)
    RoomCinema.tsx         # 04 Films (films, commercial list, daily/event photography)
    RoomDispatch.tsx       # 05 Connect (contact form)
    Modals.tsx             # project/film/still modals + lightbox wiring
    ImageLightbox.tsx      # full-screen zoom (portal to document.body)
    SmartImage.tsx         # image + LQIP skeleton; ratio="natural" for uncropped
    BeforeAfter.tsx        # drag comparison slider
    AsciiPortrait.tsx      # canvas-rendered ASCII duotone portrait
    OnboardingGuide.tsx    # first-visit spotlight tour (data-tour anchors)
    NavigationHUD.tsx      # top bar (logo, room nav, Z readout, bg opacity, theme)
    CookieConsent.tsx  PrivacyPolicy.tsx  ErrorBoundary.tsx  Toast.tsx  NotFound.tsx
    ProjectDetails.tsx     # renders headings / ◆ bullets / fenced ``` code blocks
    VideoPlayer.tsx        # YouTube-nocookie / Vimeo / self-hosted
  lib/
    supabase.ts       # client (env-driven, fetches Cache-Control: no-cache)
    content.tsx       # ContentProvider + useContent() — Supabase with data.ts fallback
    image.ts          # thumbUrl() / tinyUrl() — the ONLY way to size images
    prefetch.ts       # idle-time prefetch + img.decode()
    useImageTone.ts   # cached, idle-time average-brightness sampling
    theme.tsx  bgOpacity.tsx  video.ts  aspect.ts  errorLog.ts  useNaturalAspect.ts
  admin/             # CMS (lazy chunk at /admin)
    AdminApp.tsx  Projects/Films/Stills/PhotoEvents/Engagements/Settings/Messages/ErrorsManager.tsx
    fields.tsx  cropper.tsx  helpers.ts  useCollection.ts
supabase/migrations/  # schema + seeds, numbered 0001 → current
scripts/
  run-sql.ps1        # apply migrations / run inline SQL
  setup-imagekit.ps1 # one-time ImageKit key wizard
  perf.mjs           # real-Chrome CDP scroll profiler (room 3 = Films)
  indexnow.mjs       # ping IndexNow (Bing/Copilot/ChatGPT) after publishing content
  web.mjs            # Firecrawl search/scrape helper
vercel.json          # security headers (CSP, HSTS, etc.)
```

---

## 4. The content model — what lives where

**Live content is in Supabase.** The CMS edits it. `src/data.ts` is only the
offline fallback. **If you change content in one, update the other** — they drift
otherwise (this bit us once: stale fake "clients" in the fallback).

| Table | What | Key fields |
|---|---|---|
| `projects` | Archive cards + detail modals | `title, tag, image, images[], image_ratios[], image_positions[], image_captions[], github_url, website_url, video, detailed_description` (Markdown with fenced ``` blocks for ASCII diagrams), `published` |
| `films` | Films room | `title, image, video, release_year, duration, description, credits_role, format` |
| `stills` | Photography | `image, before_image, category ('daily'/'event'), event_id, focal_length, accent_color, title` |
| `photo_events` | Event grouping | `title, description` |
| `engagements` | Commercial list | `category, client, description, sort_order` |
| `site_settings` | Text/identity | `profile, contact, about, hero, experience, skills, languages, stats` (JSONB per key) |
| `messages` | Contact inbox | write via `submit_message` RPC only |
| `client_errors` | Error log | write via `log_client_error` RPC only |

### Editing content — the quick paths

- **Text / projects / films / stills / events / engagements / settings** → do it in the CMS at `/admin`. No code, no deploy.
- **Schema change** → write a numbered migration in `supabase/migrations/`, run it with `run-sql.ps1`, then commit both.
- **Adding a room** → touch `src/data.ts` (ROOMS), `src/App.tsx` (renderRoom + ROOM_COUNT), a new `Room*.tsx`, and the tour/`NavigationHUD` if relevant.

---

## 5. Images — the rules (non-negotiable)

1. **Always size through `thumbUrl(url, w, h?)`** (`src/lib/image.ts`). Never
   put a raw URL in a card/grid.
   - Supabase: it rewrites `/object/public/` → `/render/image/` (the transform
     endpoint). **Putting `?width=` on `/object/public/` is silently ignored and
     returns the full original** — this once made an 11 MB image load as a
     thumbnail. Never do that.
   - ImageKit: appends `tr=w-…,h-…`.
2. **`tinyUrl(url)`** gives a ~24px version for LQIP blurred placeholders.
3. **Grid thumbs are small; full-res only on click.** Lightbox uses `thumbUrl(…, 2400)`.
4. **Self-hosted files** (`public/images/`) are not transformed — keep them small.
   Photos are WebP (the originals were 68 MB of camera JPEGs → 4 MB of WebP).
5. **Don't add third-party `<script>` or `<iframe>`** — CSP blocks them (see §7).

---

## 6. Media upload pipeline (ImageKit)

- Browser → `GET /api/upload-auth` (returns short-lived HMAC signature; requires
  admin Supabase session) → browser POSTs the file **directly to ImageKit** (no
  size limit).
- `src/admin/helpers.ts` (`uploadImage`/`uploadVideo`) implements this; it also
  downscales oversized JPEG/WebP client-side (max 2560px) before upload.
- `api/upload.js` is a **fallback** proxy, capped at ~4.5 MB (Vercel serverless
  body limit). Direct upload is the primary path.

**ImageKit values:** URL endpoint id `d4ghflj3g`, folder `portfolio`, keys in
`.env.local` + Vercel env. `IMAGEKIT_PRIVATE_KEY` is server-only; the
`IMAGEKIT_PUBLIC_KEY` is public-by-design (it ships to the admin's browser).

---

## 7. Security (don't break these)

- **RLS** in Supabase: `public` reads published rows only; `authenticated`
  (admin) does writes. The anon key in the bundle is therefore safe.
- **`client_errors`** is special: no direct insert; write via `log_client_error`
  RPC (rate-limited, length-capped). Admin can read + delete.
- **Contact form** → `submit_message` RPC (SECURITY DEFINER, honeypot, 3/10-min
  rate limit). Do not re-enable direct anon inserts to `messages`.
- **CSP in `vercel.json`** is strict:
  - `script-src 'self'` — no inline/third-party scripts. Any new script needs a CSP change.
  - `frame-src` = YouTube/Vimeo only.
  - `connect-src` = self + Supabase + `https://upload.imagekit.io`.
  - `img-src` = self + data/blob/https.
- **Secrets** (all gitignored): `.env.local`, `.supabase-admin-password.txt`,
  `.supabase-db-password.txt`, `.firecrawl-key`. Vercel env holds
  `IMAGEKIT_*`, `VITE_SUPABASE_*`. GitHub secret: `SUPABASE_DB_PASSWORD`.
- **Admin signups are disabled** in Supabase. Only the pre-created account logs in.
- GitHub has **Dependabot + secret scanning + push protection enabled**. Don't
  commit anything that looks like a key — push protection will reject it.
- History was rewritten with `git-filter-repo` to remove a leaked local path.
  `main` is clean, but some pre-rewrite commits are still reachable by direct
  SHA on GitHub (needs a Support purge to fully remove — cosmetic, no secret).

---

## 8. Performance — things that were hard-won

The site is a permanently-animating WebGL scene + image-heavy grids. Measured
with `scripts/perf.mjs` (real Chrome over CDP; reloads per scenario so you see
the *first* scroll a visitor feels).

| Pitfall | Correct behaviour |
|---|---|
| Supabase transform on wrong endpoint | use `/render/image/` (via `thumbUrl`), never params on `/object/public/` |
| `useImageTone` doing `getImageData` on many images at once | cached per URL + one-at-a-time in idle; sample a tiny thumb (was a 1.3s blocking burst) |
| Decoding on first paint | prefetch calls `img.decode()`, not just download |
| `background-attachment: fixed` on body | forces full-viewport repaint each scroll frame — use a `position:fixed` pseudo-element |
| Full-screen `mix-blend-mode` overlays | force viewport-wide re-blend every frame — avoid |
| React state on every scroll event | Z readout writes to a DOM ref; scroll handler is rAF-throttled (zero re-renders while scrolling) |
| 3D world competing during scroll | it yields the GPU (bloom off + half-rate) while scrolling, restores after |
| 3D pixel ratio | capped at 1.5× (was 2×) |
| Huge `public/` folder | bloats every Vercel deployment (was 69 MB → now ~5 MB) |

Re-measure any time:

```bash
node scripts/perf.mjs http://localhost:4173/ 3   # 3 = Films room
```

---

## 9. Deploy gotchas

- **Vercel env vars only apply to *new* deployments.** If you add/change one, trigger a redeploy (push, or `vercel --prod`).
- **Serverless body limit ~4.5 MB** — the reason uploads go direct to ImageKit rather than through a function.
- **Vercel CLI** is authed as `syedwasi983-9634`; project `wasi-shah-portfolio`.
- **Deployment storage** is consumed per-deployment (public/ is copied into each). Keep `public/` small; prune old deployments with `vercel rm <url> --yes` when it climbs.
- After publishing real content, ping search engines: `node scripts/indexnow.mjs`.

---

## 10. Conventions

- **Theme:** space world is the default "light" mode; night mode (`.dark`) is a
  manual toggle only — never auto-follow the OS (`public/theme-init.js`).
- **Background opacity default = 25%** (`src/lib/bgOpacity.tsx`).
- Comments are bilingual (Chinese + English); keep that style.
- ASCII diagrams in project details use **pure ASCII** (not Unicode box glyphs) —
  Google Fonts' mono subset has mismatched widths for box-drawing chars and it
  misaligns. Wrap them in fenced ``` blocks for the `<pre>` renderer.
- Don't commit throwaway scripts or screenshots; `scripts/` should stay just the
  documented tools.
