# Design System — Retro Signboard

The whole product — public site and admin — is a handpainted retro signboard.
Solid blocks of color pulled straight from the logo, dashed inner rings,
hard-offset block shadows, chunky Alfa Slab One display type. No gradients,
no glass, no soft drop shadows, no rounded-3xl softness. Mobile-first,
logical-property CSS so RTL (he, ar) and LTR (en, ru) share one codebase.

Source of truth for the visual language: the reference bundle at
`/tmp/design-fetch/x/bowling/project/bowling-ramat-gan.jsx` (read-only). The
shared-components policy there (single `Signboard`, `BowlingCard`, `Btn`,
glyphs, tokens) maps directly to the components in this codebase.

## Principles

1. **Signboard over surface.** Sections are painted blocks; cards are solid
   plates with visible borders. Nothing "floats" on a softened shadow.
2. **Logo echo everywhere.** Every card and feature panel carries a dashed
   inner ring the same way the logo's ticket has a dashed stamp border.
3. **Hard-offset shadows, not blur.** Shadows are 2px/4px/6px offsets in
   pure `--ink`. No `blur`, no `spread`, no translucency.
4. **Chunky display, mono accents.** Big Alfa Slab One headlines sit above
   Courier Prime eyebrow labels. Body is Heebo across all scripts.
5. **One palette, both branches.** Ramat Gan and Rishon LeTsiyon share the
   red/turq/yellow trio. The per-branch accent swap is gone.
6. **Mobile first, logical RTL.** Use `ps-*/pe-*/ms-*/me-*/start/end`. Never
   `pl-*/pr-*/left/right`. Block shadows mirror via `:dir(rtl)` in globals.

## Palette

Defined in `app/globals.css` under `@theme inline` as CSS vars. Never inline
hex values in components — always reach for `bg-red`, `text-ink`, or the
arbitrary-value `[var(--red)]` escape hatch for SVG strokes.

| Token        | Hex       | Used for                                       |
| ------------ | --------- | ---------------------------------------------- |
| `--red`      | `#E23A2E` | Primary CTA, featured panels, highlight ink    |
| `--red-2`    | `#B02A20` | Red-button drop shadow, hover, secondary red   |
| `--turq`     | `#31B8C4` | Secondary accent, price band, teal banner      |
| `--turq-2`   | `#1F8F99` | Turq-button drop shadow                        |
| `--cream`    | `#F7EFE2` | Page background, card surface                  |
| `--cream-2`  | `#EADEC4` | Recessed / footer background                   |
| `--ink`      | `#1F1F1F` | Body text, all borders, all hard shadows       |
| `--yellow`   | `#F2C94C` | Ticker strip, mustard accents, open-now ribbon |
| `--yellow-2` | `#C49A2F` | Yellow-button drop shadow                      |
| `--paper`    | `#FFFFFF` | Inner card plate (menu, hero signboard)        |
| `--whatsapp` | brand     | WhatsApp green, brand-locked                   |

Shadows (utility classes map to these vars):

```
--block-sm   : 2px 2px 0 var(--ink)
--block      : 4px 4px 0 var(--ink)
--block-lg   : 6px 6px 0 var(--ink)
--btn-red    : 0 4px 0 var(--red-2)
--btn-turq   : 0 4px 0 var(--turq-2)
--btn-yellow : 0 4px 0 var(--yellow-2)
--btn-ink    : 0 4px 0 #000
```

RTL mirrors the Y-offset block shadows by redefining `--block*` to negative X
inside `:dir(rtl)`. shadcn utilities read the var at runtime, so the flip is
automatic everywhere.

## Typography

One body font per script (Heebo for Latin/Hebrew, Cairo for Arabic), plus a
chunky signboard display font per script. Mono is Courier Prime.

| Role                      | Latin         | Cyrillic (ru) | Hebrew (he)      | Arabic (ar)   |
| ------------------------- | ------------- | ------------- | ---------------- | ------------- |
| Display (`.font-display`) | Alfa Slab One | Russo One     | Rubik Mono One\* | Lalezar       |
| Body (default)            | Heebo         | Heebo         | Heebo            | Cairo         |
| Mono (eyebrows, meta)     | Courier Prime | Courier Prime | Courier Prime    | Courier Prime |

\* Rubik Mono One has Latin glyphs only; Hebrew text falls back to Heebo at
weight 800. That matches the reference design's stack (`"Rubik Mono One",
"Heebo", ...`).

Tracking: Latin headlines `-0.02em`; Hebrew headlines `0`; eyebrows
`tracking-[0.18em] uppercase` in Courier Prime.

## Signature patterns

### Signboard

A rotated solid-color block with a dashed inner ring. Used for the logo,
hero headline frame, events feature card, and in-app nameplates.

```tsx
<Signboard tone="red" rotate={-3}>
  <span className="font-display text-3xl">BOWLING</span>
</Signboard>
```

### BowlingCard

The workhorse surface. Solid plate, 2px ink border, 4–6px hard-offset ink
shadow, optional dashed inner ring echoing the logo.

```tsx
<BowlingCard surface="paper" ring="red" shadow="lg">
  ...
</BowlingCard>
```

### Dotted leader row

Menu items and price rows use a dotted horizontal leader between the name
and the price. The leader is a plain `border-b border-dotted border-ink/40`
on a flex filler, never an inline SVG.

### RetroButton

Solid fill + colored hard-offset drop shadow. Press state translates Y+3px
and collapses the shadow to `0 1px 0 var(--ink)` — a physical key-press.

```tsx
<RetroButton tone="red" size="lg" render={<a href={...}>...</a>} />
```

### Eyebrow kicker

Every section leads with `— TEXT —` in Courier Prime red, 0.18em tracking,
uppercase. Lives in `components/common/eyebrow.tsx`.

## Shared components

| Component                | Path                                      |
| ------------------------ | ----------------------------------------- |
| `Signboard`              | `components/brand/signboard.tsx`          |
| `BowlingCard`            | `components/brand/bowling-card.tsx`       |
| `RetroButton`            | `components/brand/retro-button.tsx`       |
| `BowlingLogo`            | `components/brand/bowling-logo.tsx`       |
| `Pin` / `Ball` / `Burst` | `components/brand/glyphs.tsx`             |
| `Eyebrow`                | `components/common/eyebrow.tsx`           |
| `SectionHeader`          | `components/common/section-header.tsx`    |
| `Ticker`                 | `components/common/ticker.tsx`            |
| `SiteTopbar`             | `components/layout/site-topbar.tsx`       |
| `SiteHeader`             | `components/layout/site-header.tsx`       |
| `SiteFooter`             | `components/layout/site-footer.tsx`       |
| `FloatingWhatsApp`       | `components/layout/floating-whatsapp.tsx` |

## Homepage section order

1. `SiteTopbar` — ink band, yellow "open now" ribbon on start edge, mono
   phone on end edge
2. `SiteHeader` — cream, sticky, 2px ink bottom border, logo + nav
3. `Ticker` — yellow marquee, triplicated items, 30s linear loop
4. `Hero` — cream band, `Burst/Ball/Pin` decoration, `BowlingLogo`,
   `BowlingCard` signboard headline, `RetroButton` CTA stack
5. `QuickActions` — 4 rows, each row is a colored numbered square
   (01 red, 02 turq, 03 yellow, 04 red-2) on a `BowlingCard` row
6. `PricingPreview` — turq band, cream `BowlingCard` with dashed red ring,
   dotted row leaders, red prices in display font
7. `MenuSection` — cream band, paper `BowlingCard`s with dashed turq ring,
   dotted leaders between name and price
8. `EventsTeaser` — ink band, red featured `BowlingCard` with dashed yellow
   ring, remaining packages in cream `BowlingCard`s
9. `GoogleReviews` — cream-2 band, rating card + per-review `BowlingCard`s,
   mono author credit
10. `ContactBlock` — yellow band, 3px ink top border, cream `BowlingCard`
    hours table with dotted leaders, ink + turq button pair
11. `SiteFooter` — cream-2, red BOWLING wordmark + turq city pill, dashed
    ink divider, mono meta

## Admin

Admin uses the **same retro language** as the public site — the shadcn
primitives in `components/ui/*` are restyled once so the retro look
propagates to every form, dialog, and menu without per-call-site work.

Primitive rules (shared across admin, auth, and public site):

| Primitive                       | Look                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `Input` / `Textarea`            | 2px ink border, `bg-paper`, `shadow-block-sm`; focus → `shadow-block`; invalid → red-2 |
| `Select` trigger                | same as inputs; `IconSelector` chevron in ink                                          |
| `Button` default                | red fill + `shadow-btn-red` + active translate-y (physical key press)                  |
| `Button` secondary              | turq fill + `shadow-btn-turq`                                                          |
| `Button` destructive            | red-2 fill + `shadow-btn-ink`                                                          |
| `Button` outline                | cream fill + ink border + `shadow-btn-ink`                                             |
| `Button` ghost / link           | no border, no shadow; hover → cream-2                                                  |
| `Card`                          | 2px ink border + `shadow-block`; optional `ring` prop for dashed inner ring            |
| `Dialog` / `Sheet`              | ink border, `shadow-block-lg`, ink/60 overlay                                          |
| `DropdownMenu` / `Select` popup | ink border, `shadow-block`, yellow highlight row on hover                              |
| `Tabs`                          | tab = ink-outlined chip on paper; active = red fill + `shadow-block`                   |
| `Switch`                        | ink track, cream-2 off / red on, paper knob                                            |
| `Tooltip`                       | ink fill, cream Courier Prime text, `shadow-block-sm`                                  |
| `Avatar`                        | 2px ink border, ink fallback with display-font initials                                |
| `FieldLabel`                    | Courier Prime 11px, `0.14em` tracking, uppercase                                       |
| `Separator`                     | `ink/30` hairline                                                                      |
| `Breadcrumb`                    | Courier Prime 11px, `0.14em` tracking, uppercase; active crumb bold ink                |

Admin frame:

- Sidebar header shows a small rotated red signboard mark (`BOWLING` → `B`)
  with a dashed inner ring and a block shadow. Sidebar behavior stays
  shadcn-driven (collapsible, keyboard); group labels are mono
  `0.18em` tracking uppercase in `ink-soft`.
- Topbar is cream with a 2px ink bottom border; breadcrumbs use the mono
  breadcrumb primitive above.
- Page headers use `font-display` titles + Courier Prime eyebrow via the
  shared `Eyebrow` component.
- Form sections wrap in `Card` (`shadow-block`). Use the `ring` prop
  (`red`/`turq`/`yellow`) for marketing-tone moments; omit it in dense
  form blocks to keep visual weight down.
- CTAs reuse the shadcn `Button`; reach for `RetroButton` only for
  oversized public-site hero CTAs (it's the same treatment at a larger
  size).
- First pass is light theme only. `ThemeProvider` wiring stays intact so a
  future dark-retro pass can be added without refactoring.

## Auth

`app/[locale]/(auth)/layout.tsx` is a marketing-grade retro frame:

- Cream `<main>` with `Burst`, `Ball`, and `Pin` glyph decorations bleeding
  off the corners — same family as the `Hero` section.
- `BowlingLogo` sits above a paper `BowlingCard` (red dashed inner ring,
  `shadow-block-lg`) that wraps the form.
- The login form uses the shared `Eyebrow` → Alfa Slab title → Courier
  Prime description stack, then the restyled `Input` and a full-width
  `RetroButton` for submit.
- Info and error banners are inline retro chips — 2px border, block shadow,
  yellow (info) or red-2 (error) surface — no soft-alert component.

## RTL

- Layout primitives use logical utilities only: `ps-*/pe-*/ms-*/me-*`,
  `start-*/end-*`, `border-s-*/border-e-*`, `text-start/text-end`.
- Block shadows mirror in `:dir(rtl)` via redefined `--block*` vars. The
  shadcn utilities pick this up automatically.
- Chevrons and directional arrows use `rtl:-scale-x-100` or
  `rtl:rotate-180` — never hard-coded direction variants.
- Hebrew and Arabic render right-to-left via `dir` on `<html>`, set from
  `dirFromLocale` in `i18n/routing.ts`.

## What we removed

- Per-branch accent swap. The `brand_accent` column + admin picker were
  removed; both branches share the same retro palette.
- Old "modern hospitality" surface tokens (`--surface-warm`,
  `--surface-cool`, `--surface-deep`, `--surface-muted`, `--ink-muted`,
  `--canvas`, `--line`, `--ticket-red`, `--banner-teal`).
  These are still present as **legacy aliases** in `@theme inline` pointing
  at the new palette so unmigrated components keep rendering while the
  refit continues.
- Soft shadows (`--shadow-soft`, `--shadow-card`, `--shadow-hover`) —
  remapped as aliases of `--block-sm/--block/--block-lg`.
- Fonts: Bagel Fat One, Suez One, Assistant, JetBrains Mono — replaced by
  Alfa Slab One / Rubik Mono One / Heebo / Courier Prime.
- `MobileActionBar` is no longer rendered on the homepage (the design
  dropped the sticky CTA). The file stays on disk in case we want to
  reintroduce it for a specific route.
- Soft-surface auth shell (`rounded-3xl bg-surface shadow-soft border-line`)
  and the `fieldClass` string in `login-form.tsx` — replaced by a
  `BowlingCard` frame with glyph decorations and the shared retro `Input`.
- Legacy shadcn defaults on primitives (`shadow-xs`, `rounded-2xl`,
  hairline `border-border`, glassy dropdown backdrop-blur, soft overlays)
  — each primitive now carries the retro treatment directly.

## Verification checklist

- `bun run typecheck && bun run lint` — both clean
- Walk `/he` → `/en` → `/ru` → `/ar`: block shadows flip on RTL, display
  font swaps per script, mono eyebrow renders as Courier Prime everywhere
- Both branches render in the same red/turq/yellow palette
- Admin `/he/admin/branches` shows retro chrome: red signboard mark, ink
  topbar border, mono breadcrumbs, display-font page titles
- `prefers-reduced-motion`: ticker animation freezes
