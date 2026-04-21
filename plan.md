# Admin Content System — Progress & Handoff

Source of truth for the full roadmap: `.context/attachments/pasted_text_2026-04-20_13-02-39.txt` (§§1–19). This file is gitignored; re-attach if missing.

Current state: **7 of 9 sub-projects complete** (A, B, C, D, E, F, G done; H, I remaining). Plus a retro signboard single-page redesign (#14).

---

## Completed (all merged to `main`)

| Sub-project | PR  | Commit    | Notes                                                                            |
| ----------- | --- | --------- | -------------------------------------------------------------------------------- |
| A           | —   | `1626c26` | Content schema + services layer + seed script                                    |
| B           | #6  | `0832ba5` | Branch CRUD admin, translatable inputs, drag-reorder                             |
| C           | #7  | —         | AI translation primitive (Haiku 4.5 + Gateway, 30/hr rate limit)                 |
| D           | #8  | `b771d3e` | Media library (Vercel Blob) + `<MediaPicker />`                                  |
| E.1         | #9  | `54282d0` | Packages admin tab                                                               |
| (redesign)  | #10 | `52d9644` | Admin dashboard redesign with persistent sidebar shell                           |
| E           | #11 | `dec71ce` | Prices / Events / Menu admin tabs                                                |
| F           | #13 | `44b6b13` | Contact, footer, legal pages admin                                               |
| (redesign)  | #14 | `5686df5` | Retro signboard + single-page public site                                        |
| G           | —   | pending   | Google reviews sync (this branch: `alon710/sub-project-d-media`, not yet merged) |

---

## Sub-project G — Google reviews sync (this branch)

**Branch:** `alon710/sub-project-d-media` (branch name is a leftover from earlier — rename before PR or just let the branch-rename happen at PR time).

**What shipped:**

- `review_cache` (jsonb payload + place-level aggregates) and `review` (per-review row with per-locale text columns + `ai_translated` flag + `google_review_id` unique per branch) — migration `drizzle/0004_wealthy_cassandra_nova.sql`.
- `lib/integrations/google-places.ts` — `getPlace` + `searchPlaces` against **Google Places API (New)** via `X-Goog-Api-Key` + `X-Goog-FieldMask`. Typed errors: `MissingGooglePlacesKeyError`, `GooglePlacesApiError`.
- `lib/services/reviews.ts` — `listForBranch`, `getCacheStatus`, `syncBranch`, `listBranchesWithPlaceId`. `syncBranch` picks source text from `originalText` (preferred) or `text`, detects source locale, fans out to `translateFields` for the other 3 locales via `Promise.allSettled`, upserts by `(branch_id, google_review_id)`. Short-circuits when remote text is unchanged.
- Cron: `app/api/cron/sync-reviews/route.ts` guarded by `Bearer $CRON_SECRET` (unauthenticated in non-prod for local testing). Vercel cron entry in `vercel.json` at `0 3 * * *`.
- UI: `components/admin/branch-reviews-form.tsx` with cache-age badge, "Refresh now" button, review list with star rating + AI-translated badge. "Reviews" tab promoted from `DISABLED_TABS` to `LIVE_TABS` in `components/admin/branch-edit-tabs.tsx`.
- Server action: `_actions/reviews.ts` — `syncReviewsAction` wrapped by `requireAdmin`, emits `branch:${slug}` + `branch:${slug}:reviews` tag invalidation.
- i18n: `Admin.reviews.*` keys across all 4 locales (he/en/ru/ar).
- Tests: 4 vitest cases covering FieldMask shape, 403 error mapping, and missing-key guard.

**Env:**

- `GOOGLE_PLACES_API_KEY` (required for actual sync calls; absence surfaces as a field error rather than a crash).
- `CRON_SECRET` (required in prod for the cron route; permissive in dev).

**Deferred (intentional):**

- No manual dev verification yet — requires a real Google Places API key + a DB with at least one branch that has `google_place_id` set. The `branch.google_place_id` column exists from sub-project A; set it via the Info tab of an existing branch.
- `review_cache.payload` stores the raw Google response for easy future repaving without re-calling the API.
- No "select place from search" UX yet — admin pastes the place ID directly. Sub-project H or a later polish pass can surface `searchPlaces` in a picker dialog.

---

## Remaining sub-projects

### H — Frontend cutover (replace `lib/branches.ts`)

- **Depends on:** A, B, E, F, G (all now done).
- Grep every `@/lib/branches` import, replace with services-layer calls.
- Replace `BRANCH_OVERRIDE` env var + static `domains: string[]` in `proxy.ts` with a `branch_domain` table (`branch_id, host`).
- `lib/branch-context.ts` → DB lookup cached via `unstable_cache` (or `'use cache'` if Cache Components get enabled).
- Ship behind `CONTENT_SOURCE=db|static` feature flag for one deploy cycle, then delete the static path.
- Also: surface cached reviews on the public single-page site (read `services.reviews.listForBranch`).
- Post-cutover lighthouse / LCP check (must match pre-cutover ± 200 ms).

### I — Observability & guardrails

- **Depends on:** all.
- `audit_log` table (actor, entity, action, diff jsonb), middleware hooking every services-layer mutator.
- `/admin/audit` page listing recent changes.
- Soft-delete: add `deleted_at nullable` to every content table, admin-visible trash can (30-day retention).
- `@sentry/nextjs` wired to `SENTRY_DSN`.
- Vercel Web Analytics (zero-config).
- Upgrade C's in-memory rate limit → Upstash/KV (via Vercel Marketplace) and add `ai_translation_log` table. Alert at AI-translation failure > 5%/1h.
- Alert when the daily `/api/cron/sync-reviews` run fails or when >20% of branches error.

---

## Environment variables

Currently in `.env.example`:

```
RESEND_API_KEY=
CONTACT_FROM_EMAIL=no-reply@rgbowling.com
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=            # D
GOOGLE_PLACES_API_KEY=            # G
CRON_SECRET=                      # G
```

Still to add when sub-projects land:

```
AI_TRANSLATION_MODEL=anthropic/claude-haiku-4.5   # optional override for C
SENTRY_DSN=                                        # I
UPSTASH_REDIS_REST_URL=/TOKEN                      # I (rate limit + KV)
CONTENT_SOURCE=db                                  # H (feature flag)
```

---

## Next session — pick one

1. **Open PR for G** from this branch (once branch is renamed to something like `alon710/reviews-sync`). CI is green.
2. **Start sub-project H** — the frontend cutover. Largest remaining piece. Gated by a feature flag so it's reversible.
3. **Start sub-project I** — observability. Independent of H; can ship first if we want prod safety nets in place before the big frontend swap.

CI gate: `bun run ci` (lint, format:check, test, knip, i18n-check).
