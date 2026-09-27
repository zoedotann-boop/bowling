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

Create a `.env` file (git-ignored). The contact form
(`app/api/contact/route.ts`) and the event commitment form
(`app/api/events/booking/route.ts`) email submissions via [Resend](https://resend.com):

| Variable             | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key (Resend dashboard → API Keys).                               |
| `CONTACT_FROM_EMAIL` | Sender address on a **domain verified in Resend** (e.g. `events@yourdomain.com`). Unverified domains are rejected. |
| `EVENTS_TO_EMAIL`    | Fallback inbox for inquiries when a location has no **Inquiries inbox** set in the admin (the event form attaches the signature as `signature.png`). |

Each location's **Inquiries inbox** (admin → Settings) takes priority over
`EVENTS_TO_EMAIL`; if neither is set, or `RESEND_API_KEY`/`CONTACT_FROM_EMAIL`
is missing, the route responds with `500 { error: "Email service is not configured." }`.

## Admin

The admin lives under `/admin` (login at `/admin/login`) and manages per-location
content: settings, home page, menu, events (multiple event types), plus
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

### Public site reads

The public pages render the admin's content live from the database:

- **Reads** `lib/db/queries/site.ts` — `getSiteLocations`, `getHomeContent`,
  `getMenus`, `getEvents`. Each returns every location (children ordered by
  `sortOrder`, hidden rows filtered out) so the branch switcher can swap content
  client-side without a reload.
- **Delivery** the `(site)` layout / page wrappers fetch on the server and key
  the rows by branch (`byBranch` in `lib/branches.ts`). `SiteContentProvider`
  (`components/site-content-context.tsx`) carries home + chrome content the same
  way `BranchProvider` carries branch data; menu and event content is passed to
  the page components as props.
- **Fallback** every field falls back to its `messages/*` string (and lists to
  their message array) when the DB value is blank, so the site never breaks if
  the database is unavailable or a field is unset. Copy that the admin does not
  manage (UI chrome, pricing/gymboree sections, event badges / price cards /
  rules / policy) stays in `messages/*`.
- **Event booking** the booking form renders the event type's dynamic
  `eventFormField`s when defined, otherwise the built-in fields; `POST
  /api/events/booking` stores answers in `lead.formData` and the signature in
  `lead.signatureUrl`.

### Google reviews pooler

Each branch can pull its Google Maps reviews automatically and choose which
appear in the home "reviews" section (alongside any manually curated ones).

- **Config** (admin → **Google reviews**): the branch's **Place ID** and a
  **daily automatic sync** toggle live on the `location` row
  (`googlePlaceId`, `googleReviewsAutoSync`). Fetched reviews are stored in the
  `google_review` table, keyed by Google's review id (`external_id`) so re-syncs
  update in place. An admin's **shown on site** choice is preserved across syncs;
  only published rows render publicly.
- **Fetch** `lib/google/serpapi.ts` reads reviews via [SerpApi](https://serpapi.com)
  (`google_maps_reviews` engine) — Google's own Places API caps reviews at 5 and
  needs a billed project, whereas SerpApi returns ~8 from one shared key.
  `lib/google/sync-reviews.ts` upserts them and auto-publishes new reviews rated
  ≥ 4 when the branch opted in.
- **Schedule** a nightly [Vercel Cron](https://vercel.com/docs/cron-jobs)
  (`vercel.json`, `0 3 * * *`) hits `GET /api/cron/google-reviews`, guarded by
  `Authorization: Bearer <CRON_SECRET>`. The admin **Sync now** button triggers
  the same sync on demand. When `SERPAPI_API_KEY` is unset a sync reports
  `missing-key`; when `CRON_SECRET` is unset the cron route returns `401`.

| Variable          | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `SERPAPI_API_KEY` | SerpApi key used to read Google Maps reviews (shared across branches).   |
| `CRON_SECRET`     | Bearer secret protecting the cron route (`openssl rand -base64 32`). Sent automatically by Vercel Cron. |
