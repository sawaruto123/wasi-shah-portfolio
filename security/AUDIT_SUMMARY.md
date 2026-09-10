# Security & Quality Audit Summary

App: **WASI SHAH / 峻山 — portfolio-v3** (React + Three.js + Vite · Supabase · ImageKit · Vercel)
Date: 2026 · Method: `vibe-code-check` skill (investigate → report → fix → verify)

## Findings

| # | Category | Finding | Status |
|---|----------|---------|--------|
| 1 | **Auth** | `POST /api/upload` had **no caller authentication** — anyone could upload files and fill the ImageKit account | **FIXED** — now requires a valid Supabase session (verified: 401 without/with bogus token) |
| 2 | **Security headers** | Missing `Strict-Transport-Security` (HSTS) | **FIXED** — `max-age=63072000; includeSubDomains; preload` (verified live) |
| 3 | **CSP** | No `frame-src`/`media-src` → YouTube/Vimeo embeds **and** ImageKit videos were blocked by `default-src 'self'` | **FIXED** — added `frame-src` (YouTube/Vimeo) + `media-src` (verified live) |
| 4 | **UI polish** | Admin login password field had no show/hide toggle | **FIXED** — eye toggle added |
| 5 | **Privacy** | Policy/cookies didn't mention ImageKit or video embeds | **FIXED** — updated privacy policy + consent copy; YouTube now uses `youtube-nocookie` |
| 6 | Secrets | Keys/tokens in frontend or committed files | **PASS** — only `.env.example` (placeholders) tracked; `.env*`, `.firecrawl-key`, admin password gitignored |
| 7 | XSS | `innerHTML` / `dangerouslySetInnerHTML` sinks | **PASS** — none; React escapes by default, Supabase uses parameterised PostgREST |
| 8 | Access control | RLS: writes require authenticated admin; signups disabled | **PASS** |
| 9 | Rate limiting | Contact form | **PASS** — rate-limited (3 / 10 min / email) via RPC + honeypot |
| 10 | Errors | Generic client errors; no stack traces/paths | **PASS** |
| 11 | Code quality | Dead code / duplicate defs / placeholder data / `console.log` spam | **PASS** — none found |
| 12 | Deps | Hallucinated packages | **PASS** — react, three, lucide-react, tailwind only |
| 13 | Completeness | Real backend end-to-end (contact, CMS CRUD, media upload) | **PASS** — ImageKit upload verified live (200 + CDN URL) |

## Monitoring & backups (now set up)

- **Database backups** — `.github/workflows/db-backup.yml` runs `pg_dump` (version-matched `postgres:17` client) **weekly**, plus a manual trigger, and stores the dump as a **90-day artifact**. Secret: `SUPABASE_DB_PASSWORD`. Verified: run `34447064288` succeeded (244 KB dump).
- **Error observability** — uncaught errors, unhandled promise rejections, and React crashes are written to the Supabase **`client_errors`** table (RLS: public insert, admin read) and viewable in the CMS → **Errors** tab.

## Left for a human (can't be done from code)

1. **Verify a real upload** through the **live** CMS (`/admin` → any image field) once — local `vite dev` can't run `/api/upload`.
2. **(Optional) Backup retention** — Actions artifacts expire after 90 days. For longer/off-site retention, add another destination (private repo or storage bucket).

## Notes
- New third parties in the stack: **ImageKit** (media CDN), **YouTube/Vimeo** (video embeds) — reflected in `/privacy`.
- The unauthenticated-upload fix (finding #1) is the important one: it closed an open write path to your ImageKit account.
