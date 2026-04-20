# Bowling

Multi-branch bowling website. One Next.js app, two domains (`rgbowling.com`, `rlbowling.com`), four locales (`he` default / `en` / `ru` / `ar`) with full RTL/LTR.

## Getting started

```bash
bun install
bun run dev
```

Open http://localhost:3000 - you'll be redirected to `/he` and the **first** branch from `lib/branches.ts` (Ramat Gan) is shown.

### Switching branches in dev

- **Query param**: append `?branch=rishon-letsiyon` (or `ramat-gan`).
- **Env var**: set `BRANCH_OVERRIDE=rishon-letsiyon` in `.env.local` to pin a branch for the whole session.
- **Header switcher**: in dev the switcher updates the `?branch=` param; in production it navigates to the matching domain.

### Switching locales

`/he` (default), `/en`, `/ru`, `/ar`. Hebrew and Arabic auto-switch the document direction to RTL.

## Architecture

- `proxy.ts` - Next 16 routing middleware. Wraps `next-intl`'s middleware and stamps a `bowling_branch` cookie that downstream RSCs read via `getCurrentBranch()`.
- `lib/branches.ts` - single source of truth for branch content (TypeScript, no CMS).
- `i18n/{routing,request,navigation}.ts` - `next-intl` v4 setup.
- `messages/*.json` - chrome / form / nav strings.
- `app/[locale]/(site)/` - locale-aware pages with shared chrome (header, footer, floating WhatsApp).
- `app/sitemap.ts`, `app/robots.ts` - per-branch × per-locale sitemaps.

## Contact form

Wired to Resend via `app/[locale]/(site)/contact/_actions.ts`. Set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`. Without `RESEND_API_KEY` the action logs to stdout and reports success - handy for development.

## Deploying multiple domains on Vercel

1. Push to a Vercel project.
2. **Settings → Domains** → add `rgbowling.com` and `rlbowling.com` (and `www.` aliases). Both point at the same project; Vercel serves the same build for every host.
3. Update the `domains` array in `lib/branches.ts` to include the production hostnames. The proxy looks them up case-insensitively.
4. Manage `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` with `vercel env add`.

No per-branch deployments, no per-branch builds - one project covers both.

## Scripts

```bash
bun run dev        # Next dev with Turbopack
bun run build      # Production build
bun run start      # Run the production build
bun run lint       # ESLint
bun run typecheck  # TypeScript --noEmit
bun run format     # Prettier write
```
