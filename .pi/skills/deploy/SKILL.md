---
name: deploy
description: Build, commit, and push the portfolio to GitHub (triggers Vercel auto-deploy). Use whenever the user wants to ship/deploy changes, or after finishing edits that should go live.
---

# Deploy

Run all commands from the repository root — this file lives at `<repo>/.pi/skills/deploy/SKILL.md`, so the root is three levels up.

## Steps

1. Build first — it MUST pass before pushing:

```powershell
npm run build
```

Check that the output ends with `BUILD EXIT: 0`.

2. Commit and push:

```powershell
$env:Path = "C:\Program Files\Git\cmd;$env:Path"
git add -A
git commit -m "<short, descriptive message>"
git push
```

3. **Push retries:** GitHub often fails with a network error ("Failed to connect to github.com:443"). If the push fails, wait a few seconds and retry `git push` — it usually succeeds on the 2nd or 3rd attempt.

4. After a successful push, Vercel auto-deploys in ~30–60s. Tell the user to hard-refresh (Ctrl+Shift+R).

## Notes

- Never commit secrets: `.env*`, `.firecrawl-key`, `.supabase-admin-password.txt` are already gitignored — leave them out.
- If a Supabase schema change is part of the work, run the migration FIRST (see AGENTS.md for `run-sql.ps1`), then commit both the migration file and the code.
