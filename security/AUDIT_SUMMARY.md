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

## Left for a human (can't be done from code)

1. **Database backups** — Supabase **free tier has no automated backups/PITR**. Either upgrade to Pro (7-day PITR) or run a scheduled `pg_dump` export. *Risk: total data loss on a bad migration.*
2. **Error observability** — errors currently go to `console.error` only (no aggregation). Consider a free Sentry project or a Vercel log drain if you want to see runtime errors.
3. **ImageKit upload testing** — verify a real upload through the **live** CMS (`/admin`) once, since local `vite dev` can't run `/api/upload`.

## Notes
- New third parties in the stack: **ImageKit** (media CDN), **YouTube/Vimeo** (video embeds) — reflected in `/privacy`.
- The unauthenticated-upload fix (finding #1) is the important one: it closed an open write path to your ImageKit account.
