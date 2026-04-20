# Bowling - Design Language

Single source of truth for the visual language shared across every surface - public marketing, admin panel, and auth flows. **The site is mobile-first**, defaults to Hebrew (RTL), and runs in HE / EN / RU / AR.

This document is design language only: tokens, typography, shapes, shadows, motion, direction, and accessibility. Page inventory, section order, and component file listings live next to the code they describe.

---

## Principles

1. **Modern hospitality, warm on warm.** Warm white canvas, near-black ink, restrained color. The reference is a premium hospitality brand - calm surfaces, generous whitespace, one quiet accent per branch.
2. **One accent per branch.** `--brand-accent` is set once at the `(site)` root and is the only color used for emphasis in marketing surfaces. Never introduce a new hue per section - reach for weight, scale, or whitespace first.
3. **Soft edges, soft shadows.** Thin `border-line` hairlines, layered `shadow-soft` / `shadow-card` elevation, `rounded-2xl` cards, `rounded-full` pills and CTAs. No hard offsets, no colored glows.
4. **No gradients.** Flat color only. No `bg-gradient-*`, no `linear-gradient`, no `radial-gradient`, no neon glows, no colored box-shadows. The single allowed exception: `mask-image` gradients, which are a pixel-reveal effect, not a visual gradient. `backdrop-blur-md` is permitted on sticky headers only.
5. **Editorial spacing.** Generous whitespace, centered section headers, short accent dot / eyebrow label above headings. Sections breathe - never wall-to-wall content.
6. **Logical CSS, always.** Hebrew + Arabic flip the layout at runtime. Use Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`) and CSS logical properties (`inset-inline-start/end`, `padding-inline`). No `pl-*` / `pr-*` / `left-*` / `right-*` / `text-left` / `text-right` for direction-mirrored properties.
7. **Mobile-first, no exceptions.** Default styles target a 360px viewport. Tap targets ≥44px. `sm:` / `md:` / `lg:` only enhance - never _fix_ a broken mobile state.
8. **Motion is soft, not showy.** Hover nudges (`scale-[1.02]`, shadow promotion from `shadow-soft` to `shadow-card`, small color shifts), nothing that bounces or flashes. Honor `prefers-reduced-motion: reduce`.

---

## Color Tokens

Defined as `@theme` CSS variables in `app/globals.css` (Tailwind v4 - CSS-first config, no `tailwind.config.js`). Always reference via Tailwind utilities - never hardcode `oklch()` or hex.

### Surfaces & ink

| Token            | Role                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `canvas`         | Page background - warm white, slightly off-white to reduce glare          |
| `surface`        | Cards, popovers, sticky header background                                 |
| `surface-muted`  | Recessed surfaces, secondary chips, footer rows, input backgrounds        |
| `surface-warm`   | Hero / spotlight section tint - warm cream                                |
| `surface-cool`   | Alternate spotlight tint - dim mint                                       |
| `surface-deep`   | Near-ink panel for high-contrast blocks                                   |
| `paper`          | Text color on red ticket and dark panels - the "logo paper" cream         |
| `ink`            | Body text, primary buttons, all borders when an emphasis border is needed |
| `ink-soft`       | Secondary copy, eyebrow labels                                            |
| `ink-muted`      | Tertiary copy, placeholders, meta text                                    |
| `line`           | All hairline borders, dividers, input outlines                            |

Light is the default. Dark mode inverts the surface/ink pair at lower lightness; shapes and rules stay identical.

### Brand accents

| Token          | Purpose                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| `ticket-red`   | Branch accent for Ramat Gan (`cherry` key), the `BowlingLogo` red ticket field         |
| `banner-teal`  | Branch accent for Rishon LeTsiyon (`teal` key), the `BowlingLogo` city banner          |
| `brand-accent` | Per-branch accent resolved at the `(site)` root via `data-branch-accent`               |
| `brand-accent-soft` | 10% mix of `brand-accent` over `surface` for tints                                |

The two accent keys (`cherry`, `teal`) deliberately pull from the logo so each branch wears one half of the ticket-stub palette. The logo itself always uses the fixed `ticket-red` + `banner-teal` pair regardless of accent.

### Functional colors

| Token             | Purpose                                                                          |
| ----------------- | -------------------------------------------------------------------------------- |
| `whatsapp`        | Floating WhatsApp CTA only - brand color carries instant meaning                 |
| `whatsapp-hover`  | Hover state for the WhatsApp pill                                                |
| `destructive`     | Errors, delete actions, aria-invalid states                                      |
| `ring`            | Focus outline color - resolves to `ink`                                          |

External brand colors (WhatsApp, Google) are only allowed on calls-to-action that carry brand meaning, and must be declared as tokens - never inline.

---

## Typography

Three roles, four scripts. All loaded via `next/font/google` in `app/[locale]/layout.tsx`, scoped via `:lang(...)` in `globals.css` - never branched in component code.

| Role                                          | Latin (default)  | Cyrillic (`ru`)           | Hebrew (`he`)    | Arabic (`ar`)    |
| --------------------------------------------- | ---------------- | ------------------------- | ---------------- | ---------------- |
| Body + headings (`font-sans`, `font-heading`) | `Geist`          | `Geist` (cyrillic subset) | `Heebo`          | `Cairo`          |
| Numerics - prices, hours (`font-mono`)        | `JetBrains Mono` | `JetBrains Mono`          | `JetBrains Mono` | `JetBrains Mono` |
| Logo wordmark only (`font-display`)           | `Bagel Fat One`  | `Russo One`               | `Suez One`       | `Lalezar`        |

Body and headings share a single family per script - emphasis comes from weight and size, not a second face. The `font-display` family is reserved for the `BowlingLogo` wordmark; never use it for UI headings.

The `BOWLING` wordmark in the logo always renders in `Bagel Fat One` (Latin string, never localized); only the city banner below switches script.

**Tracking.** Latin headings use `letter-spacing: -0.02em` (applied automatically to `h1`-`h4` / `.font-heading`). Hebrew + Arabic reset to `0` (tight tracking is a Latin convention). Eyebrows always use `tracking-[0.18em]` wide uppercase regardless of script.

**Weights.** Body copy is `font-medium` at 400; headings are `font-semibold` 600 to `font-bold` 700. Eyebrow labels are `font-medium` uppercase at 11-12px.

---

## Shapes & Elevation

### Radius scale

| Token          | Use                                                         |
| -------------- | ----------------------------------------------------------- |
| `rounded-none` | Table cells, full-bleed utility rows                        |
| `rounded-md`   | Inline chips, compact controls                              |
| `rounded-xl`   | Inputs, nested controls, small cards                        |
| `rounded-2xl`  | Primary cards, ticket-stub panels, info tiles               |
| `rounded-full` | Pills, CTAs, floating action buttons, status dots, avatars  |

`rounded-3xl`+ on every surface reads bubble-y — don't use it as a default.

### Borders

| Utility           | Use                                                                         |
| ----------------- | --------------------------------------------------------------------------- |
| `border border-line` | Default hairline on cards, inputs, dividers                              |
| `border-b border-line` | Sticky header / section divider                                        |
| `border-2 border-dashed border-paper` | Only inside `BowlingLogo` - the stamped-ticket perforation |

No 2px+ ink borders in UI — reserve thick dashed borders for the logo mark only.

### Shadows

| Token          | Use                                                                                 |
| -------------- | ----------------------------------------------------------------------------------- |
| `shadow-soft`  | Default card rest state, inputs, pill CTAs                                          |
| `shadow-card`  | Featured cards, hover-promoted state from `shadow-soft`                             |
| `shadow-hover` | Heaviest lift, reserved for primary CTAs on hover                                   |

Shadows are soft, layered, and color-free (`rgb(0 0 0 / …)`). No hard offsets, no colored glows, no `shadow-block`-style rigid stamps.

---

## Signature patterns

### Eyebrow + heading + subtitle

The section-header rhythm. `SectionHeader` wraps it:

```tsx
<SectionHeader
  eyebrow="Prices"
  title="Bowl all night, every night"
  subtitle="Per game, per lane, shoe rental — all in one table."
/>
```

- `Eyebrow`: 11px, `font-medium`, `tracking-[0.18em]`, `uppercase`, `text-ink-muted`.
- Heading: `font-heading text-4xl sm:text-5xl text-ink`.
- Subtitle: `text-base sm:text-lg text-ink-soft`.

### Card surface

```
rounded-2xl border border-line bg-surface shadow-soft p-5 sm:p-6
```

Variants:

- **Default** (`bg-surface` on `bg-canvas` pages): for content cards.
- **Warm feature** (`bg-surface-warm`): for hero panels and highlighted info blocks.
- **Deep contrast** (`bg-surface-deep text-paper`): for a single high-impact block per page.

### Buttons & CTAs

| Variant          | Shape & surface                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Primary pill     | `rounded-full bg-whatsapp text-white px-7 h-12 shadow-soft hover:shadow-card hover:bg-whatsapp-hover`   |
| Secondary pill   | `rounded-full border border-line bg-surface text-ink px-7 h-12 shadow-soft hover:bg-surface-muted`      |
| Compact link     | `inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3` - gap-grow is the affordance  |
| Status badge     | `inline-flex gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft`        |

Hover: shadow promotion (`shadow-soft` → `shadow-card`), a 2% scale, or a small gap increase on link arrows. Press state: `translate-y-px` via the Button primitive. Never rely on color pulse or glow.

### Floating WhatsApp

Fixed bottom-end pill, 56×56, `bg-whatsapp`, `shadow-card`, always visible, never overlapping the `pb-safe` area.

---

## Motion

- **Hover on buttons / clickable cards**: 150–200ms ease-out, shadow promotion + 2% scale on primary, color shift on secondary.
- **Link arrows** use `hover:gap-3` to nudge rather than translate.
- **All animations honor `prefers-reduced-motion: reduce`** — `globals.css` clamps `animation-duration` and `transition-duration` to `0.001ms` inside the media query.

---

## RTL support

Site runs LTR (English, Russian) and RTL (Hebrew, Arabic) at runtime - `dir` attribute set on `<html>` from `dirFromLocale()`.

**Required (Principle 6 - applies in every component):**

- Use Tailwind logical utilities - `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end` - instead of `pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*`, `text-left`, `text-right`.
- Use CSS logical properties - `inset-inline-start/end`, `padding-inline`, `margin-inline-start` - instead of physical equivalents.
- For direction-conditional styles, use Tailwind's `rtl:` / `ltr:` variants (e.g. `rtl:rotate-180` to flip a chevron or arrow icon).

**Directional icons** (chevrons, back arrows): use `rtl:rotate-180` for symmetric arrows. For asymmetric icons, swap the component conditionally.

**Sanctioned physical exceptions** (don't refactor):

- Symmetric decorative shapes whose left/right placement is visually balanced.
- Full-bleed fixed positioning (`top-0 left-0 right-0` on a full-width header).
- Centered transforms (`left-1/2 -translate-x-1/2` for centered overlays).

---

## Accessibility defaults

- All interactive elements get a visible `:focus-visible` ring - `outline: 2px solid color-mix(in oklch, var(--ink) 75%, transparent); outline-offset: 3px; border-radius: 6px;` (declared in `globals.css`).
- Decorative SVGs/shapes: `aria-hidden`.
- Icon-only buttons: `aria-label` required.
- Color contrast: body copy is `text-ink` on `bg-canvas`/`bg-surface` (≥ 12:1). Secondary copy is `text-ink-soft` (≥ 4.5:1), tertiary is `text-ink-muted` (≥ 3:1, reserved for meta only). Never gray-on-gray for primary copy.
- External links open with `target="_blank" rel="noopener"`.
- Tap targets ≥ 44×44px on mobile - CTAs default to `h-12`, icon buttons to `size-10` or larger.

---

## Mobile-first rules

- Section vertical rhythm: `py-20` mobile → `sm:py-28` → `lg:py-32`. Side padding: `px-4 sm:px-6 lg:px-8` inside an `mx-auto max-w-6xl` container.
- Hero headline: `text-[clamp(2.5rem,7vw,4.5rem)]`. Don't push beyond 4.5rem - fluid type already tops out there.
- Sticky header: `h-16` mobile, `sm:h-18`. Navigation collapses into a `Sheet` below `md`. Branch + locale switchers stay reachable at all sizes.
- Floating WhatsApp: bottom-end, 56×56, never overlaps primary CTAs (mind `pb-safe`).
- Grids: single column default, `sm:grid-cols-2`, `lg:grid-cols-3`. Never start at 3-col.
- Hero CTA stack: vertical on mobile (`flex-col items-stretch`), wraps horizontal `sm:flex-row`.

---

## Tooling

- **Tailwind CSS v4** - no `tailwind.config.js`. All design tokens live in the `@theme` block of `app/globals.css`.
- **Next.js 16** App Router, `proxy.ts` (not `middleware.ts`).
- **next-intl v4** for i18n (`defineRouting`, `getRequestConfig`, `setRequestLocale`).
- **shadcn `base-lyra`** style - components use `@base-ui/react` primitives with `render` prop (NOT `asChild`).
- **`@tabler/icons-react`** for all iconography. Don't introduce a second icon set.

---

## Anti-patterns

Tracked here so we don't drift back into looks we've ruled out:

- `text-glow`, `shadow-glow*`, colored box-shadows - the look is printed ink, not LED.
- `bg-gradient-*`, `blur-3xl` background blobs - modern AI-app cliché.
- `backdrop-blur-*` on chips, cards, or non-header surfaces - glassmorphism reads as generic SaaS.
- Body radial-gradient backgrounds - solid warm paper, not aurora.
- `rounded-3xl`+ on every surface - bubble-y. Use `rounded-2xl` for cards, `rounded-xl` for inputs, `rounded-full` for pills.
- Scale-and-shadow stacks (`hover:scale-105 hover:shadow-2xl`) - replaced with soft shadow promotion + 2% scale max.
- Second display face for UI headings - `font-display` is the logo wordmark's font, not the site's headline face.

---

## Maintenance

Update this file when you:

- Add a color token, font, radius, or shadow value.
- Change a signature pattern (card, CTA, eyebrow, shadow tier).
- Add or retire a motion or focus convention.
- Change the RTL / accessibility / mobile rules.

Outdated rules are worse than no rules. If the code disagrees with this file, fix this file before writing more code.
