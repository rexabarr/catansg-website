# catansg.com

Static site for Catan Strategy Group. Plain HTML/CSS/JS, no build step, deployed via GitHub Pages.

## Structure

- `index.html` — homepage (masthead, hero, engagements ledger, mandates, who we consider, "Request our help" form, footer). Owners' Thoughts is a top-level nav link, not a homepage section.
- `owners-thoughts/` — blog index + one article page per slug. Content is fetched client-side from Supabase (`posts` table, `published = true` only). 4 real articles are live: family succession, hiring volume, building wealth outside the business, investing without a broker.
- `privacy/`, `terms/` — legal pages (placeholder copy, pending legal review).
- `assets/css/main.css` — the whole design system (tokens, components, animations).
- `assets/js/main.js` — form handling, scroll-reveal, Supabase hydration.
- `assets/js/supabase-client.js` — read-only Supabase client (anon key) for blog/hero-figures fetches.
- `CNAME` — custom domain for GitHub Pages.

## Backend

- **Supabase project**: `csg-website` (`vuixqisulynzefymwykw`), tables `practice_status`, `contacts`, `posts`. RLS: anon can read `practice_status` and published `posts`, and insert into `contacts`; nothing else is public.
- **Make.com**: scenario "CSG website - waitlist form" (id `4913304`, team "Catan Strategy Group" / `425847`) — Custom Webhook → `json:CreateJSON` (safe escaping) → HTTP insert into Supabase `contacts` → email `info@catansg.com` via the existing `make@catansg.com` Microsoft connection. Active and tested end-to-end (including quotes/commas/newlines in free-text fields). The webhook URL is wired into `assets/js/main.js` as `MAKE_WEBHOOK_URL`.

## Before this goes live on catansg.com

- [ ] Confirm the "Projects under review" figure (currently 9, a placeholder) in `practice_status`.
- [ ] Build the "What we have done" section (above "Who we consider") — needs the six items Rex wrote; not yet built, see chat.
- [ ] Legal review of `/privacy/` and `/terms/`.
- [ ] Point DNS at GitHub Pages (see the 4 A records + `www` CNAME in the deployment notes) and enable "Enforce HTTPS" once it propagates.
