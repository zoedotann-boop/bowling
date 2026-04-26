# Bowling

Multi-branch bowling website. One Next.js 16 (App Router) app serving multiple
branded domains and four locales (`he` default / `en` / `ru` / `ar`) with full
RTL/LTR support.

## Stack

- Next.js 16 + React 19, App Router, Turbopack dev
- TypeScript (strict), Tailwind v4, shadcn/ui, Base UI
- next-intl v4 for i18n; Hebrew and Arabic switch document direction to RTL
- Drizzle ORM + Postgres for branch content
- Better Auth (magic-link OTP) for admin
- Vercel Blob for media, Resend for contact email
- Bun for package management and scripts; ESLint, Prettier, Vitest, Knip

## Layout

- `proxy.ts` — Next 16 routing middleware wrapping `next-intl`.
- `app/[locale]/(site)/` — public pages.
- `app/[locale]/admin/(protected)/` — protected admin area, server actions in
  `_actions/*.ts`.
- `lib/db/schema/` — Drizzle schema for branches, hours, prices, packages,
  events, menu, reviews, footer, legal, domains.
- `lib/services/*` — read paths cached via `unstable_cache`; mutators emit
  `revalidateTag` / `revalidatePath`.
- `lib/site-branch.ts` — resolves the active branch (host → cookie → default).
- `lib/admin/forms.ts` — shared admin form-action helpers (`withAdmin`,
  `applyWrite`, `readTranslation`, `readNumberOr`).
- `i18n/{routing,request,navigation}.ts` — `next-intl` setup.
- `messages/*.json` — chrome / form / nav strings.
- `components/admin/{shared,branch,translation,media}` — admin UI.

## Branch resolution

Active branch is picked by host (mapped in `branch_domain`) → `site-branch`
cookie → default branch (lowest `sort_order`). Host lookup is case-insensitive
and strips the port; subdomains must be mapped explicitly.

## Scripts

```bash
bun run dev         # Next dev with Turbopack
bun run build       # Production build
bun run lint        # ESLint, --max-warnings 0
bun run typecheck   # tsc --noEmit
bun run test        # Vitest
bun run format      # Prettier write
bun run knip        # Unused exports
bun run i18n-check  # Validate translation keys across locales
bun run ci          # lint + format:check + test + knip + i18n-check
```

## Conventions

- Server actions live in `app/[locale]/admin/(protected)/_actions/*.ts` and use
  the `withAdmin` / `applyWrite` helpers from `lib/admin/forms.ts`.
- Reads go through `lib/services/*` and are cached; writes call the matching
  service mutator and rely on its `revalidateTag` / `revalidatePath` calls.
- All four locale files in `messages/` must stay in sync — `i18n-check`
  enforces this.
- Default locale is `he`. RTL is the default direction.
