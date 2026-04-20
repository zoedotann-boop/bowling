# Admin Content System — Progress & Handoff

Source of truth for the full roadmap: `.context/attachments/pasted_text_2026-04-20_13-02-39.txt` (§§1–19). This file is gitignored; re-attach if missing.

Current state: **3 of 9 sub-projects complete.** Both open PRs stack on their predecessor.

---

## Completed

### A — Content data model + services layer ✅ **merged to main**

- Commit `1626c26` on `main`.
- `lib/db/schema/content.ts` (branch + translation, hours, prices, packages, events, menu, review_cache, media_asset).
- `lib/services/*` (branches, hours, menu, prices, packages, events, media, format, schemas, types, locale-resolver).
- `scripts/seed-from-branches.ts` idempotent, reads `lib/branches.ts`.

### B — Branch CRUD admin 🟡 **PR open, not yet merged**

- Branch: `alon710/admin-branch-crud`. PR: **#6**.
- `/he/admin/branches` list with drag-reorder + publish toggle.
- `/he/admin/branches/new` and `/he/admin/branches/[slug]` (tabs: Info, Hero, SEO, Hours live; Prices/Packages/Menu/Events/Reviews disabled "Soon").
- `TranslatableInput` / `TranslatableTextarea` with per-locale tabs + "needs review" badge.
- Server actions wrapped by `requireAdmin()`, `revalidateTag` + `revalidatePath` on write.

### C — AI translation primitive 🟡 **PR open, stacked on B**

- Branch: `alon710/ai-translation`. PR: **#7** (base = `alon710/admin-branch-crud`).
- `lib/ai/{gateway,translate,rate-limit}.ts` — Haiku 4.5 via AI SDK v6 `generateText` + `Output.object`, OIDC-first auth, 30/hr per-user sliding window (in-memory).
- `_actions/translate.ts` — `translateBranchFieldsAction`, parallel per-locale fan-out, structured `console.info` logs.
- `translation-state-context.tsx` — `useSyncExternalStore` store, emits hidden `aiGenerated.{locale}` inputs.
- Per-field `AiSparkleButton` + record-level `FillTranslationsButton`. Save-flow stamps `aiGenerated`/`aiGeneratedAt`/`reviewedAt`.
- `Admin.translate.*` i18n keys in all 4 locales; `aiComingSoon` removed.
- Vitest: 8 tests (prompt shape, empty-field strip, 8-field cap, 30/hr rate limit).

**C — deferred (intentionally, per plan):**

- `translation_glossary` table (C.2): `/* TODO(C.2) */` marker in the system prompt builder.
- `ai_translation_log` table: moved to sub-project I (observability).
- Upstash/KV-backed rate limit: moved to sub-project I. Current in-memory bucket resets on cold start.
- Manual dev verification was **not run** (requires `vercel env pull` → OIDC token, or a local `AI_GATEWAY_API_KEY`). CI is green.

---

## Immediate next steps (pick up in next session)

1. **Rebase / merge chain.**
   - PR #6 needs review / merge into `main`.
   - Once #6 lands, rebase `alon710/ai-translation` onto `main` and re-target PR #7's base to `main`. Expected: clean rebase (no new files on main touch the C files).
2. **Manual verification of C with real Gateway credentials.** Checklist in PR #7 body. Confirm: per-field sparkle populates en/ru/ar, save writes `ai_generated=true` + `reviewed_at=NULL`, manual edit flips to `ai_generated=false` + `reviewed_at` stamped, Fill button does 3 parallel requests, rate limit triggers after 30 calls/hr, empty-source toast fires.
3. **Pick the next sub-project** — recommendation: **E** (validates C's primitive on 4 new forms). If E feels too big, **D** (media) is standalone and smaller.

---

## Remaining sub-projects

### D — Media library (Vercel Blob)

- **Depends on:** A (done).
- Schema: `media_asset` row (id, filename, content*type, size, width/height, blob_url, uploaded_by, alt_text*{he,en,ru,ar}). Alt-text on the row (not a separate translation table — short, rarely changes).
- Routes: `/admin/media` grid + `POST /api/admin/media/upload` (multipart, `requireAdmin`, MIME + <5 MB validation).
- Reusable `<MediaPicker />` dialog for hero/event/menu-item forms.
- `next.config.mjs` — add Vercel Blob hostname to `remotePatterns`.
- One-off script to migrate current hardcoded Unsplash URLs → `media_asset` rows.
- Env: `BLOB_READ_WRITE_TOKEN`.

### E — Menu / Prices / Events / Packages admin

- **Depends on:** A, C, D.
- Enables the currently-disabled tabs on the branch edit shell.
- Reuses `TranslationStateProvider` from C across 4 new forms. Good first validation that the primitive generalizes.
- Pattern: generic `<OrderedList />` with drag-reorder, per-row translatable fields, per-row Fill-translations.
- Server actions: `add/update/delete/reorder` × 4 entities. All existing `lib/services/{menu,prices,events,packages}.ts` are already built (sub-project A) and currently `knip`-ignored — remove them from `package.json` knip ignore as they get consumed.
- Menu is two-level (categories → items). Prices has `kind = "hourly" | "shoe"`. Events have an image (from D's picker). Packages: title + price + perks paragraph.

### F — Contact & footer admin

- **Depends on:** A, C.
- Contact fields already live on the `branch` row (phone/whatsapp/email/mapUrl — no translation).
- New: `footer_link` table (`locale, group_key, label, href, sort_order`) and `legal_page` (`slug, body_markdown_<locale>`).
- Routes: `/admin/contact/[branch]`, `/admin/footer`. Tiny markdown renderer on the public side for legal pages.

### G — Google reviews sync

- **Depends on:** A. Parallelizable with D–F.
- API: **Google Places API (New)** — `places:searchText` + `places.getPlace` with `reviews` field mask (API-key only, not OAuth).
- Schema: `review_cache` (jsonb payload) + `review` (author, rating, text\_{original,en,ru,he,ar}, ai_translated flag).
- Flow: admin sets `branch.google_place_id`, Vercel cron daily at 03:00 UTC pulls, if review `original_locale` ≠ ours then translate via sub-project C, store all 4 variants.
- `/admin/reviews/[branch]` shows cache age + "Refresh now" button.
- Env: `GOOGLE_PLACES_API_KEY`.

### H — Frontend cutover (replace `lib/branches.ts`)

- **Depends on:** A, B, E, F, G.
- Grep every `@/lib/branches` import, replace with services-layer calls.
- Replace `BRANCH_OVERRIDE` env var + static `domains: string[]` in `proxy.ts` with a `branch_domain` table (`branch_id, host`).
- `lib/branch-context.ts` → DB lookup cached via `unstable_cache` (or `'use cache'` if we enable Cache Components).
- Ship behind `CONTENT_SOURCE=db|static` feature flag for one deploy cycle, then delete the static path.
- Post-cutover lighthouse / LCP check (must match pre-cutover ± 200 ms).

### I — Observability & guardrails

- **Depends on:** all.
- `audit_log` table (actor, entity, action, diff jsonb), middleware hooking every services-layer mutator.
- `/admin/audit` page listing recent changes.
- Soft-delete: add `deleted_at nullable` to every content table, admin-visible trash can (30-day retention).
- `@sentry/nextjs` wired to `SENTRY_DSN`.
- Vercel Web Analytics (zero-config).
- Upgrade C's in-memory rate limit → Upstash/KV and add `ai_translation_log` table. Alert at AI-translation failure > 5%/1h.

---

## Environment variables to add as sub-projects land

```
AI_TRANSLATION_MODEL=anthropic/claude-haiku-4.5   # optional override (C — not added to .env.example per roadmap §15)
BLOB_READ_WRITE_TOKEN=                            # D
GOOGLE_PLACES_API_KEY=                            # G
SENTRY_DSN=                                       # I
```

---

## Current branch / PR / commit summary

| Sub-project | Branch                      | PR                                                     | Status                       |
| ----------- | --------------------------- | ------------------------------------------------------ | ---------------------------- |
| A           | (merged)                    | —                                                      | landed on `main` (`1626c26`) |
| B           | `alon710/admin-branch-crud` | [#6](https://github.com/zoedotann-boop/bowling/pull/6) | open, mergeable              |
| C           | `alon710/ai-translation`    | [#7](https://github.com/zoedotann-boop/bowling/pull/7) | open, stacked on B           |
| D–I         | —                           | —                                                      | not started                  |

Definition-of-done for the whole roadmap lives in §18 of the attachment. CI gate: `bun run ci`.
