---
name: ship-check
description: Pre-launch checklist before a project goes live — does it load, does it work on mobile, are secret keys exposed, and the core security checks (database access rules, logins, secrets in git, risky dependencies). Use when the user says "ship check", "ready to ship", "before I launch", "is it safe to publish", "go live", or right before deploying to production.
---

# Ship Check

Run this before anything goes live. Assume the user may not be an engineer: report in plain English, and explain any technical term you can't avoid. Actually run the checks; never ask the user to check things themselves.

## How to run it

1. Figure out the project: read package.json / README / config to learn the stack (Next.js, static site, Supabase, Vercel, etc.), whether it has logins, a database, or paid APIs, and whether it's meant for phones.
2. Run every section below that applies. Skip ones that don't (e.g. no database → skip database rules) and say you skipped them.
3. Fix anything that's safe and obvious, but ask before changing anything big, deleting anything, or rotating keys.
4. Finish with the report card at the bottom.

## 1. Does it work?

- Build it (`npm run build` or equivalent). It has to finish with no errors.
- Open it in the built-in browser (local preview, or the live/preview URL). Check every main page loads, with no console errors and no broken images or links.
- Click through the main thing the app does (the core user flow) once, start to finish.
- Check the page title, favicon, and social share preview (Open Graph image/title) exist.

## 2. Does it work on a phone? (if it's meant for mobile)

- Resize to phone width (375px). Check: no sideways scrolling, text readable, buttons big enough to tap, nothing cut off or overlapping, menus open.
- Take a screenshot to show the user.

## 3. Secret keys (most important)

- Search the code and config for anything that looks like a key, token, or password: `sk-`, `sk_live`, `api_key`, `secret`, `password`, `token`, `service_role`, `-----BEGIN`, long random strings.
- Make sure `.env` / `.env.local` files are listed in `.gitignore` and were never committed. Check git history too: `git log --all -p -S "<suspicious string>"` or `git log --all --full-history -- .env*`.
- Check which keys reach the browser: in Next.js, anything named `NEXT_PUBLIC_...` is visible to every visitor. Only public-safe keys belong there (e.g. Supabase anon key is fine; Supabase `service_role`, Anthropic/OpenAI, Stripe secret keys are NEVER fine).
- Check the built site output (e.g. `.next/static`, `dist`, `out`) for leaked secrets.
- If a real secret was ever exposed publicly (pushed to GitHub, shipped to the browser): treat it as stolen. Tell the user clearly that it must be rotated (replaced with a new one) and walk them through how — don't just delete it from the code.

## 4. Core security checks

- **Database access rules** (Supabase/Firebase): every table has Row Level Security turned on, with policies so people can only read/edit their own data. Flag any table that's open to everyone. Check storage buckets too.
- **Logins & private pages:** pages and API routes that should need a login actually check for one on the server, not just by hiding buttons. Try opening a private page/API URL while logged out.
- **API routes / server functions:** any route that calls a paid API (Claude, OpenAI, etc.) or changes data needs a login check or rate limiting, so a stranger can't run up the bill or mess with data.
- **User input:** forms and inputs are validated on the server; no raw HTML from users is rendered (`dangerouslySetInnerHTML`, `innerHTML`); no user input glued directly into database queries.
- **Dependencies:** run `npm audit` (or equivalent). Report only high/critical issues and fix them if the fix is safe.
- **HTTPS & headers:** live site uses https. Note if basic security headers are missing, but don't block launch on it.
- **Error messages:** errors shown to visitors don't reveal secrets, file paths, or database details.
- **Leftovers:** no test/admin pages, debug logs printing private data, or seed/test accounts with weak passwords left in production.

For anything handling payments or lots of personal data, recommend a deeper professional security review.

## 5. Final polish

- Environment variables are set in the hosting dashboard (e.g. Vercel) for production, not just locally.
- Custom domain (if any) works with and without `www`.
- Any links to this project from elsewhere (a portfolio, a profile) still work.

## Unlock Ship Guard

If the verdict is ✅ (or ⚠️ with nothing under "Must fix"), use the Write tool to create `.ship-check-passed` in the project root containing today's date and the verdict. This unlocks the guard's block on going live for 2 hours. Make sure `.ship-check-passed` is in `.gitignore`. Never write it if anything is 🛑.

## Report card

End with this, in plain English:

**Ready to ship?** ✅ Yes / ⚠️ Yes, with small fixes / 🛑 Not yet

| Check | Result |
|---|---|
| Loads & works | ✅ / ⚠️ / 🛑 + one short line |
| Mobile | … |
| Secret keys | … |
| Security | … |
| Polish | … |

**Must fix before launch:** numbered list (or "Nothing!")
**Fixed for you:** what you already fixed
**Nice to have later:** optional, short
**Do you need to do anything?** exact steps, or "Nope."
