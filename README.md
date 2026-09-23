# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Environment variables

Create a `.env` file (git-ignored). The event booking form
(`app/api/events/booking/route.ts`) emails submissions via [Resend](https://resend.com):

| Variable             | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key (Resend dashboard → API Keys).                               |
| `CONTACT_FROM_EMAIL` | Sender address on a **domain verified in Resend** (e.g. `events@yourdomain.com`). Unverified domains are rejected. |
| `EVENTS_TO_EMAIL`    | Inbox that receives event booking submissions (the signature is attached as `signature.png`). |

If any of these are missing, the route responds with `500 { error: "Email service is not configured." }`.

## Admin

The admin lives under `/admin` (login at `/admin/login`) and manages per-location
content: settings, home page, menu, events (multiple event types), leads, plus
owner-only Locations and Team. It uses **Drizzle ORM + PostgreSQL** and
**Better Auth** (email + password, signup disabled).

### Setup

Add these to `.env` (already scaffolded):

| Variable              | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string (Neon, Supabase, or local). |
| `BETTER_AUTH_SECRET`  | Random signing secret, min 32 chars (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL`     | Public base URL, no trailing slash (dev: `http://localhost:3000`). |

Then:

```bash
bun run db:generate   # generate SQL migrations from lib/db/schema
bun run db:migrate    # apply them to DATABASE_URL
bun run db:seed       # create the owner login + the two branches
```

`db:seed` creates an owner from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
(defaults `owner@example.com` / `changeme123`). There is no public signup —
users are provisioned by an owner.

### Architecture

- **Schema** `lib/db/schema/*` (re-exported via `index.ts`, relations in
  `relations.ts`). Localized text is a `jsonb` `{ he, en }` column; `he` is the
  source language and falls back for missing translations.
- **Access** `lib/admin/{access,permissions,routes}.ts` — a single gate.
  Every page/action calls `requireLocationAccess(slug, capability)`.
- **Shared UI** `components/admin/*` — `AdminShell`, `SectionForm` (holds the
  draft + language toggle + single publish action), `RowTable` (reorderable
  lists, modal editor at top level / inline when nested), and the `admin-ui`
  primitives.
- **Save pattern** each section is `page → Drizzle query → draft → SectionForm
  → one server action` that persists the whole draft via `syncCollection`
  (`lib/actions/admin/*`). `sortOrder` is assigned from array index on save.

> Note: the public site still renders its hardcoded content
> (`lib/branches.ts`, `messages/*`). Wiring the public pages to read from the
> admin database is a follow-up.
