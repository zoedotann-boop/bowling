# Bowling

Multi-branch bowling website. One Next.js app, multiple branded domains, four locales (`he` default / `en` / `ru` / `ar`) with full RTL/LTR.

## Getting started

```bash
bun install
bun run dev
```

Open http://localhost:3000 — you'll be redirected to `/he` and the first published branch (lowest `sort_order`) is shown.

### Switching branches in dev

- **Branch switcher** in the site header sets a `site-branch` cookie.
- **Mapped host**: visiting a host listed in the `branch_domain` table (e.g. `rgbowling.com`) routes to that branch. Map hosts in `/admin/branches/<slug>/domains`.

### Switching locales

`/he` (default), `/en`, `/ru`, `/ar`. Hebrew and Arabic auto-switch the document direction to RTL.

## Architecture

- `proxy.ts` — Next 16 routing middleware. Wraps `next-intl`'s middleware.
- `lib/db/schema/content.ts` — Drizzle schema. All branch content (info, hours, prices, packages, events, menu, reviews, footer, legal, domains) lives in Postgres.
- `lib/services/*` — services layer. Read paths cached via `next/cache` `unstable_cache`; mutators emit `revalidateTags`.
- `lib/site-branch.ts` — resolves the active branch (host → cookie → default) and assembles the `SiteBranch` shape consumed by the public site.
- `i18n/{routing,request,navigation}.ts` — `next-intl` v4 setup.
- `messages/*.json` — chrome / form / nav strings.
- `app/[locale]/(site)/` — locale-aware public pages.
- `app/[locale]/admin/(protected)/` — admin (Better Auth + magic-link OTP).
- `app/sitemap.ts`, `app/robots.ts` — per-branch × per-locale sitemaps.

## Contact form

Wired to Resend via `app/[locale]/(site)/contact/_actions.ts`. Set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`. Without `RESEND_API_KEY` the action logs to stdout and reports success — handy for development.

## Deploying multiple domains on Vercel

1. Push to a Vercel project.
2. **Settings → Domains** → add each branded domain (and `www.` aliases). Every domain points at the same project; Vercel serves one build for every host.
3. In the admin (`/admin/branches/<slug>/domains`), map each production hostname to the right branch. Lookup is case-insensitive and strips the port; subdomains must be mapped explicitly.
4. Manage env vars (`RESEND_API_KEY`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `GOOGLE_PLACES_API_KEY`, `CRON_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CONTACT_FROM_EMAIL`) with `vercel env add`.

No per-branch deployments, no per-branch builds — one project covers all branches.

## Scripts

```bash
bun run dev        # Next dev with Turbopack
bun run build      # Production build
bun run start      # Run the production build
bun run lint       # ESLint
bun run typecheck  # TypeScript --noEmit
bun run format     # Prettier write
```
