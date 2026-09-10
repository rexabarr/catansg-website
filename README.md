# catansg.com

Static site for Catan Strategy Group. Plain HTML/CSS/JS, no build step, deployed via GitHub Pages.

## Structure

- `index.html` — homepage (masthead, hero, engagements ledger, mandates, who we consider, waitlist form, Owners' Thoughts preview, footer).
- `owners-thoughts/` — blog index + one article page per slug. Content is fetched client-side from Supabase (`posts` table, `published = true` only).
- `privacy/`, `terms/` — legal pages (placeholder copy, pending legal review).
- `assets/css/main.css` — the whole design system (tokens, components, animations).
- `assets/js/main.js` — form handling, scroll-reveal, Supabase hydration.
- `assets/js/supabase-client.js` — read-only Supabase client (anon key) for blog/hero-figures fetches.
- `CNAME` — custom domain for GitHub Pages.

## Backend

- **Supabase project**: `csg-website` (`vuixqisulynzefymwykw`), tables `practice_status`, `contacts`, `posts`. RLS: anon can read `practice_status` and published `posts`, and insert into `contacts`; nothing else is public.
- **Make.com**: scenario "CSG website - waitlist form" (id `4913304`, team "Catan Strategy Group" / `425847`) — Custom Webhook → `json:CreateJSON` (safe escaping) → HTTP insert into Supabase `contacts` → email `info@catansg.com` via the existing `make@catansg.com` Microsoft connection. Active and tested end-to-end (including quotes/commas/newlines in free-text fields). The webhook URL is wired into `assets/js/main.js` as `MAKE_WEBHOOK_URL`.

## Before this goes live on catansg.com

- [ ] Update `practice_status` in Supabase with real seats-occupied / list-count / next-review figures.
- [ ] Replace the placeholder row in the "Present engagements" table (`index.html`) with real anonymized sector/tenure/mandate data.
- [ ] Populate the 3 `posts` rows with the real article content and set `published = true`.
- [ ] Legal review of `/privacy/` and `/terms/`.
- [ ] Point DNS at GitHub Pages (see the 4 A records + `www` CNAME in the deployment notes) and enable "Enforce HTTPS" once it propagates.
