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

## Code comments

CI runs [commentless](https://github.com/barad-side-hustle/commentless) to stop
new explanatory comments landing — put the explanation in a test name instead.
Directives (`eslint-disable`, `@ts-expect-error`, …) are always kept.

```bash
bun run comments:check    # fails on any removable comment
bun run comments:remove   # strip comments in place
```

`commentless.config.json` sets `maxAllowed` to `0`. For the rare comment that
must stay, mark it with `// commentless-keep`.

## React Doctor

CI runs [React Doctor](https://github.com/millionco/react-doctor) and fails on
error-level findings (warnings are reported only). It is a pinned dev dependency
so it installs from `bun.lock` like everything else — bump it deliberately.

```bash
bun run doctor
```

## Environment variables

Create a `.env` file (git-ignored). The contact form
(`app/api/contact/route.ts`) and the event commitment form
(`app/api/events/booking/route.ts`) email submissions via [Resend](https://resend.com):

| Variable             | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key (Resend dashboard → API Keys).                               |
| `CONTACT_FROM_EMAIL` | Sender address on a **domain verified in Resend** (e.g. `events@yourdomain.com`). Unverified domains are rejected. |
| `EVENTS_TO_EMAIL`    | Fallback inbox for inquiries when a location has no **Inquiries inbox** set in the admin (the event form email includes the event's rules, booking policy and the confirmed terms, with the signature shown inline and attached as `signature.png`). |

Each location's **Inquiries inbox** (admin → Settings) takes priority over
`EVENTS_TO_EMAIL`; if neither is set, or `RESEND_API_KEY`/`CONTACT_FROM_EMAIL`
is missing, the route responds with `500 { error: "Email service is not configured." }`.

### Invitation PDF

Every booking form ("טופס אישור והתחייבות") also sends the customer an
`invitation.pdf`: an A4 landscape invitation over the bowling artwork with the
branch logo, address and phone as saved in the admin (falling back to
`lib/branches.ts`), the requested day and date, the time from the form's **שעה** field (15
minutes before the booked time, so guests arrive early; the form tells the
customer so under the field), and the
celebrants' names (or the customer's first name).
Birthday events (`birthdays`, `gymboree`, `no-room`) get birthday wording;
other events get a general party invitation. The form sends each field's type,
so dates and times are found in admin-added fields too.

It is rendered on the server with [`@react-pdf/renderer`](https://react-pdf.org)
(its bidi support handles the Hebrew text) in `lib/invitations/`, using the
Rubik fonts (OFL) and the background artwork in `lib/invitations/assets/`.
An uploaded logo that is missing or not PNG/JPEG is replaced by the bundled
`public/logo-*.png`. `next.config.ts` adds those files to the booking route's
file trace. If the PDF fails to render, the email is sent without it.

## Admin

The admin lives under `/admin` (login at `/admin/login`) and manages per-location
content: settings, home page, menu, events (multiple event types, each with
its own page image, the small badges above the page title, upgrades (plus the booking form's upgrades-box title and
explanation), "what to bring" lists, booking policy and confirmation-form
texts — unsaved ones show the `messages/*` defaults), the
**Terms & accessibility** pages, plus owner-only Locations and Team. It uses **Drizzle ORM + PostgreSQL** and
**Better Auth**. The login page (`/admin/login`) has two tabs: **Password**
(`emailAndPassword`) and **One-time code** (the `emailOTP` plugin emails a
6-digit code). Both are always available to every team member. Invitations,
"forgot password" links and one-time codes are all emailed, so `RESEND_API_KEY`
is required; they are sent from `login@<BETTER_AUTH_URL host>`, or
`login@bowlingil.com` on localhost, so verify that domain in Resend and publish
a DMARC record for it, e.g. `_dmarc` TXT `v=DMARC1; p=none;`. Public signup is
disabled for both methods.

### Setup

Add these to `.env` (already scaffolded):

| Variable              | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string (Neon, Supabase, or local). |
| `DATABASE_URL_UNPOOLED` | Optional direct (non-pooler) connection string. `db:migrate` uses it when set, and hides Postgres `NOTICE` output. On Neon, drop `-pooler` from the host. |
| `BETTER_AUTH_SECRET`  | Random signing secret, min 32 chars (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL`     | Public base URL, no trailing slash (dev: `http://localhost:3000`). Its host (minus `www.`) is also the login-code sender domain: `login@<host>` (`login@bowlingil.com` on localhost). |
| `BLOB_READ_WRITE_TOKEN` | [Vercel Blob](https://vercel.com/docs/vercel-blob) token for admin image uploads (the "Upload" button next to image fields; files go straight from the browser to the public `bowling-images` store via `app/api/admin/upload`). Set automatically on Vercel; locally run `vercel env pull .env.local`. |

Then:

```bash
bun run db:generate   # generate SQL migrations from lib/db/schema
bun run db:migrate    # apply them (DATABASE_URL_UNPOOLED if set, else DATABASE_URL)
bun run db:seed       # create the owner + the two branches
```

Unit tests run with `bun test` (`bun run test`). `bunfig.toml` preloads
`lib/db/testing/preload.ts`, which swaps `@/lib/db` for an in-memory PGlite
database (all migrations applied) for the whole run, so tests never touch the
real database. Auth tests (`lib/auth.test.ts`) exercise the real Better Auth
config against it and capture outgoing emails via `lib/db/testing/auth.ts`.

`db:seed` creates an owner from `SEED_ADMIN_EMAIL` (default
`owner@example.com`) without a password. Sign in at `/admin/login` on the
**One-time code** tab, or choose **Forgot your password, or don't have one
yet?** on the Password tab to get a link for choosing one. There is no public
signup: owners add everyone else under **Team** (`/admin/team`) — name, email,
role, and (for managers/staff) the locations they may edit.

Adding a member emails them an **invitation** with a link to
`/admin/set-password`, where they choose a password (min. 8 characters) and are
signed straight in. The same page handles "forgot password" links (the email
says "reset" instead of "invite" once the user has a password). Links are
single-use and valid for 24 hours (`lib/admin/password.ts`); an expired link
offers to send a new one. Resetting a password signs the user out of every
other session. One-time codes keep working whether or not a password is set.

### Architecture

- **Schema** `lib/db/schema/*` (re-exported via `index.ts`, relations in
  `relations.ts`). Localized text is a `jsonb` `{ he, en }` column; `he` is the
  source language and falls back for missing translations.
- **Access** `lib/admin/{access,permissions,routes}.ts` — a single gate.
  Every page/action calls `requireLocationAccess(slug, capability)`.
- **Shared UI** `components/admin/*` — `AdminShell`, `SectionForm` (holds the
  draft + language toggle + single publish action), `AdminTabs` (splits a long
  section into tabs), `CollectionEditor` (side list + detail panel for
  top-level collections such as menu categories and event types), `RowTable`
  (reorderable rows that expand in place to edit), and the `admin-ui`
  primitives. Editing never opens a pop-up; only irreversible Team deletions
  ask for confirmation in a dialog.
- **Non-technical by design** — the admin is used by branch managers and
  staff, so internal identifiers stay out of the UI: an event type's or
  location's page address is only asked for when it is created (pre-filled
  for event types), booking-form fields get an auto-generated key (the inquiry
  email shows the field's label), dropdown option values follow their
  Hebrew label, and every booking form has exactly one fixed **שעה** field
  that staff can move but not edit or delete: the customer picks from every
  quarter hour (`TIME_OPTIONS`, 00:00–23:45) with a note that the invitation
  shows a time 15 minutes earlier. `withTimeField` (`lib/events/detail-defaults.ts`)
  adds or resets it when the editor loads and again on save. SEO texts and the Google Place ID are owner-only (in the UI and
  in the save actions).
- **Save pattern** each section is `page → Drizzle query → draft → SectionForm
  → one server action` that persists the whole draft via `syncCollection`
  (`lib/actions/admin/*`). `sortOrder` is assigned from array index on save.
  The owner-only **Team** page is the exception: create / edit / delete apply
  immediately via `lib/actions/admin/team.ts` (user row + `location_member`
  rows in one transaction; owners can't demote or delete themselves).

### Branch routing

`/` is the landing page: a full-screen branch chooser with one card per branch
(logo, lane count, gymboree tag, address). Every public page lives under its
branch — `/ramat-gan`, `/rishon/menu`, `/rishon/events/birthdays`, … — in
`app/[branch]/`, whose layout validates the slug (`generateStaticParams` +
`dynamicParams = false`, unknown slugs 404) and passes it to `SiteChrome` /
`BranchProvider`. Build links with `branchPath(id, path)`; the header branch
switcher keeps the current page via `switchBranchPath`. The contact and booking
forms send `branch` in the request body so emails go to that branch.
Pre-branch URLs (`/menu`, `/events/*`, `/contact`, `/terms`, `/accessibility`)
redirect permanently to the default branch (`next.config.ts`).

### Public site reads

The public pages render the admin's content live from the database:

- **Reads** `lib/db/queries/site.ts` — `getSiteBranches`, `getHomeContent`,
  `getMenus`, `getEvents`. Each returns every location (children ordered by
  `sortOrder`, hidden rows filtered out).
- **Delivery** the `[branch]` layout / page wrappers fetch on the server and key
  the rows by branch (`byBranch` in `lib/branches.ts`). `SiteContentProvider`
  (`components/site-content-context.tsx`) carries home + chrome content the same
  way `BranchProvider` carries branch data; menu and event content is passed to
  the page components as props.
- **Fallback** every field falls back to its `messages/*` string (and lists to
  their message array) when the DB value is blank (except reviews, which only
  ever come from Google — see below), so the site never breaks if
  the database is unavailable or a field is unset. Copy that the admin does not
  manage (UI chrome, pricing/gymboree sections) stays in `messages/*`.
- **Event badges** the tags above an event page's title ("מגיל 8+", …) are
  `event_type_content.badges` (a list of `{ he, en }`). NULL shows the
  `messages/*` defaults (`eventDetails[.branch.<id>].<slug>.badges`), which the
  admin editor opens prefilled with; an empty list hides them.
- **Event prices** each event type has a list of price options (name, days,
  highlight tag, price, participants included, price per extra participant)
  plus a note under the heading, stored as `event_type_content.price_options`
  / `price_note`. While they are NULL the page and the admin editor use the
  defaults in `messages/*` (`eventDetails[.branch.<id>].<slug>.price`); an
  empty list hides the Price section. The "Price summary" box above the booking
  form follows `price_summary_mode`: `auto` builds its rows from the price
  options, `manual` shows `price_summary_rows`, `hidden` hides it (NULL = `auto`
  where the messages set `showPriceSummary`, else hidden). The deposit line
  appears under both.
- **Menu prices** each menu item has a list of prices in `menu_item.prices`
  (`{ label, amount, isVisible }`, `lib/menu.ts`). Most items have one unnamed
  price; drinks sold in several sizes get one named price per size (צ׳ייסר /
  שוט / בקבוק). Hidden prices and prices without an amount are not shown; an
  empty list shows no price. A new item in the admin starts with the price
  names of the item above it.
- **Legal pages** `/terms` (תקנון האתר) and `/accessibility` (הצהרת נגישות)
  render the branch's `legal_page` row (admin → **Terms & accessibility**,
  managers and owners). The body is plain text: `## ` starts a section card,
  `- ` a checklist item, a blank line a new paragraph (`parseLegalBody` in
  `lib/legal.ts`). Each language that is empty falls back to the default copy
  in `messages/*` (`legalPages.<kind>.defaultBody`); the editor opens
  prefilled with it, and saving text identical to the default (or clearing it)
  stores nothing, so the default keeps tracking `messages/*` and "Last updated"
  reflects real edits only.
- **Event booking** the booking form renders the event type's dynamic
  `eventFormField`s when defined, otherwise the built-in fields (which include
  a required **שעה** time field after the date); `POST
  /api/events/booking` stores answers in `lead.formData` and the signature in
  `lead.signatureUrl`.

### Google reviews pooler

Each branch pulls its Google Maps reviews automatically and chooses which
appear in the home "reviews" section. These real reviews are the section's only
source — there are no hand-written or placeholder testimonials — so the section
is hidden until a branch has at least one published review. Up to 9 are shown
(`getHomeContent`), with a link to the branch's full list on Google.

- **Config** (admin → **Google reviews**): the branch's **Place ID** (owners
  only, under the collapsed connection settings) and a
  **daily automatic sync** toggle live on the `location` row
  (`googlePlaceId`, `googleReviewsAutoSync`). Fetched reviews are stored in the
  `google_review` table, keyed by Google's review id (`external_id`) so re-syncs
  update in place. An admin's **shown on site** choice is preserved across syncs;
  only published rows render publicly.
- **Fetch** `lib/google/serpapi.ts` reads reviews via [SerpApi](https://serpapi.com)
  (`google_maps_reviews` engine) — Google's own Places API caps reviews at 5 and
  needs a billed project, whereas SerpApi pages through the full list from one
  shared key. It requests Google's "most relevant" order (`qualityScore`, which
  front-loads written reviews — "newest" is mostly rating-only ones, which are
  skipped) and follows `next_page_token` for up to `MAX_PAGES` pages (8 + 20 =
  28 reviews). Each page is one SerpApi search: 2 pages × 2 branches nightly ≈
  120 searches/month, inside the free tier.
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
