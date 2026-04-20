# Bowling - Design System

Single source of truth for the visual language across both branches (`Bowling Ramat Gan`, `Bowling Rishon LeTsiyon`). Update this file whenever a pattern is added, changed, or retired. **The site is mobile-first**, defaults to Hebrew (RTL), and runs in HE / EN / RU / AR.

---

## Principles

1. **Vintage bowling-alley signage, not 2020s SaaS.** Warm cream paper, chocolate ink, hand-drawn-feeling chunky type. The reference is a 1970s American bowling poster, not a modern dashboard.
2. **One accent per branch.** `--brand-accent` is set once at the `(site)` root by branch and is the only color used for emphasis. Never introduce a new hue per section - reach for accent, weight, or scale first.
3. **Sharp on sharp, hard on hard.** 2px solid ink borders. 4px hard-offset block shadows (no blur). Reserve `rounded-2xl` for cards/tickets; reserve `rounded-full` for pill chips and the floating CTA. **No bubble shapes** (`rounded-3xl`+ on every surface).
4. **No gradients - including blurred color fades.** Flat color only. No `bg-gradient-*`, no `linear-gradient`, no `radial-gradient`, no neon glows, no colored box-shadows, no glassmorphism (`backdrop-blur-*`). The single allowed exception: `mask-image` gradients, which are a pixel-reveal effect, not a visual gradient.
5. **Editorial spacing.** Generous whitespace, asymmetric offsets, single accent bars under headlines. Sections breathe - never wall-to-wall content.
6. **Logical CSS, always.** Hebrew + Arabic flip the layout at runtime. Use Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`) and CSS logical properties (`inset-inline-start/end`, `padding-inline`). No `pl-*` / `pr-*` / `left-*` / `right-*` / `text-left` / `text-right` for direction-mirrored properties. The `:dir(rtl)` selector handles shadow flips.
7. **Mobile-first, no exceptions.** Default styles target a 360px viewport. Tap targets ≥44px. `sm:` / `md:` / `lg:` only enhance - never _fix_ a broken mobile state.
8. **Motion is soft, not showy.** Hover lifts (`translate-y-[1px]` + shadow drop), nothing that bounces or flashes. Honor `prefers-reduced-motion: reduce`.

---

## Color Tokens

Defined as `@theme` CSS variables in `app/globals.css` (Tailwind v4 - CSS-first config, no `tailwind.config.js`). Always reference via Tailwind utilities - never hardcode `oklch()` or hex.

### Surfaces & ink

| Token      | OKLCH            | Usage                                    |
| ---------- | ---------------- | ---------------------------------------- |
| `paper`    | `0.955 0.018 80` | Page background, card surfaces           |
| `cream`    | `0.92 0.035 75`  | Recessed surfaces, footer, table headers |
| `ink`      | `0.22 0.035 50`  | Body text, all borders, all hard shadows |
| `ink-soft` | `0.45 0.04 55`   | Secondary copy, eyebrow labels           |

### Brand accents (per-branch swap)

`<div data-branch-accent="...">` at `(site)/layout.tsx` swaps `--brand-accent` to one of these:

| Token          | OKLCH          | Branch                                                           |
| -------------- | -------------- | ---------------------------------------------------------------- |
| `ticket-red`   | `0.62 0.22 25` | `ramat-gan` (`cherry` key) - matches the logo's red ticket field |
| `banner-teal`  | `0.7 0.1 200`  | `rishon-letsiyon` (`teal` key) - matches the logo's banner       |
| `brand-cherry` | `0.5 0.2 25`   | Display headline tint, link hover                                |

The two accent keys (`cherry`, `teal`) deliberately pull from the logo so each branch wears one half of the ticket-stub palette.

### Logo & special-purpose

| Token         | OKLCH           | Usage                                                            |
| ------------- | --------------- | ---------------------------------------------------------------- |
| `ticket-red`  | `0.62 0.22 25`  | The `BowlingLogo` red ticket field - fixed across branches       |
| `banner-teal` | `0.7 0.1 200`   | The `BowlingLogo` teal city-banner - fixed across branches       |
| `whatsapp`    | `0.62 0.16 155` | Floating WhatsApp CTA only - brand color carries instant meaning |

External brand colors (WhatsApp, Google) are allowed for floating CTAs only and must be declared as tokens - never inline.

### Dark mode

Same hues at lower lightness (`paper` → deep cocoa, `ink` → cream). Same shapes, inverted ink. Dark is _not_ the default - light cream paper is.

---

## Typography

Three roles, four scripts. All loaded via `next/font/google` in `app/[locale]/layout.tsx`, scoped via `:lang(...)` in `globals.css` - never branched in component code.

| Role                                                    | Latin (default)  | Cyrillic (`ru`)           | Hebrew (`he`)    | Arabic (`ar`)    |
| ------------------------------------------------------- | ---------------- | ------------------------- | ---------------- | ---------------- |
| Display headlines + `BOWLING` wordmark (`font-display`) | `Bagel Fat One`  | `Russo One`               | `Suez One`       | `Lalezar`        |
| Body, labels, eyebrows (`font-sans`)                    | `Geist`          | `Geist` (cyrillic subset) | `Heebo`          | `Cairo`          |
| Numerics - prices, hours (`font-mono`)                  | `JetBrains Mono` | `JetBrains Mono`          | `JetBrains Mono` | `JetBrains Mono` |

Each script gets a chunky retro display companion that holds the same weight as `Bagel Fat One` so headlines stay loud across all four locales. The `BOWLING` wordmark in the logo always renders in `Bagel Fat One` (Latin string, never localized); only the city banner below switches script.

Tracking: Latin headlines use `letter-spacing: -0.02em`; Cyrillic headlines use `-0.01em`; Hebrew + Arabic reset to `0` (tight tracking is a Latin convention). Eyebrows always use `tracking-[0.18em]` wide uppercase regardless of script.

---

## Signature Patterns

### Eyebrow + Heading + Accent Bar

Every major section follows this rhythm:

```tsx
<Eyebrow>Prices</Eyebrow>
<h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
  Bowl all night, <span className="text-brand-cherry">every night</span>.
</h2>
<AccentBar className="mt-5" />
```

- `Eyebrow`: small uppercase tracked-out label in `text-ink-soft`.
- Headline: display font, ink color, optional `text-brand-cherry` highlight on the closing word.
- `AccentBar`: 12–20px wide, 3px tall solid `bg-brand-accent` block.

### Ticket card

The signature surface - a torn-edge ticket stub in paper or accent color:

```
rounded-2xl border-2 border-ink bg-paper shadow-block p-5 sm:p-6
```

Variants:

- **Default** (`bg-paper`): for content cards.
- **Featured** (`bg-brand-accent text-paper`): for the events teaser headline panel.
- **Hover lift**: `hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-block-sm` for clickable cards/buttons. Never on static cards.

### Buttons

| Variant   | Classes                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Primary   | `rounded-xl border-2 border-ink bg-brand-accent font-bold text-paper shadow-block`                                      |
| Secondary | `rounded-xl border-2 border-ink bg-paper font-bold text-ink shadow-block`                                               |
| Ghost     | text-only, no border, no shadow                                                                                         |
| Pill chip | `rounded-full border-2 border-ink bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]` - for tags only |

Press state: `hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-block-sm`. The shadow shrinks as the button "presses into" it.

### Marquee band

Horizontally-scrolling uppercase strip in `bg-brand-accent text-paper`, used as a section divider. Linear, 22s per loop, duplicated track for seamless wrap. Pauses on hover. Honors `prefers-reduced-motion`.

---

## Shared Components

| Component          | File                                      | Purpose                                                                                                                                 |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| `BowlingLogo`      | `components/brand/bowling-logo.tsx`       | The ticket-stub logo: red rectangle + dashed white border + chunky `BOWLING` wordmark + teal city banner. Branch-aware via `city` prop. |
| `Eyebrow`          | `components/common/eyebrow.tsx`           | Small tracked-out uppercase label above a heading.                                                                                      |
| `AccentBar`        | `components/common/accent-bar.tsx`        | 3px tall block in `bg-brand-accent`. Width via `size="sm"                                                                               | "md" | "lg"`. |
| `Marquee`          | `components/common/marquee.tsx`           | Scrolling uppercase band, RTL-aware.                                                                                                    |
| `FloatingWhatsApp` | `components/layout/floating-whatsapp.tsx` | Fixed bottom-end pill in `--whatsapp` brand green, branch-aware link.                                                                   |

### When to extract a new component

Extract when a visual pattern appears in **two different places** AND at least one is true:

- It has non-trivial structure (multiple wrappers, pseudo-elements).
- It takes props that vary meaningfully between uses.
- Getting it wrong would break the design language.

Don't extract a one-off block, a trivial Tailwind combo, or a pattern that hasn't stabilized - copy it twice first.

---

## Logo

`BowlingLogo` is the brand mark. Composition:

1. **Outer ticket field**: red rounded rectangle (`bg-ticket-red`), slight `-rotate-2`.
2. **Perforated edge**: inner `border-2 border-dashed border-paper` with offset padding - reads as a stamped ticket stub.
3. **Wordmark**: `BOWLING` in `font-display` white, single line, no descenders.
4. **City banner**: smaller teal rounded-rect (`bg-banner-teal`) below, `+rotate-1`, with the same dashed-white inner border. City name comes from `branch.city[locale]`.

Sizes: `sm` (header / footer), `md` (default), `lg` (hero overlay if needed). Always renders as a single inline-flex unit - never split across containers.

The wordmark stays the same across all 3 branches; only the city banner text changes. **Don't add per-branch tweaks to colors or geometry** - the brand is consistent; the city tells you where you are.

---

## Sections (homepage order)

The homepage is composed in `app/[locale]/(site)/page.tsx`. Order, top to bottom:

1. **Hero** - branch eyebrow, headline, tagline, primary + secondary CTAs.
2. **Prices** (`מחירים`) - table of per-game / per-lane prices + shoe rental row.
3. **Menu** (`תפריט`) - food + drinks list, two-column layout, mono-typed prices.
4. **Events & Birthdays** (`ימי הולדת \ אירועים`) - featured package on a `bg-brand-accent` ticket panel + secondary list.
5. **Google Reviews** - average rating, count, 2 quoted reviews, link to the full Google profile.
6. **Contact** (`צור קשר`) - address, phone, email, hours, WhatsApp + contact-page CTAs.

Sections from the previous build that are _not_ on the homepage:

- `Highlights` - moved to the in-depth pages where it earns its space.
- `Gallery` - currently a placeholder; show only when real photography is wired in.

---

## Motion

- **Hover lift on buttons / clickable cards**: `translate-x-[1px] translate-y-[1px]` + `shadow-block-sm` (from `shadow-block`), 120–160ms ease-out.
- **Marquee**: linear, 22s per loop, duplicated track for seamless wrap. `paused` on hover.
- **All animations must honor `prefers-reduced-motion: reduce`** - set `animation: none` and skip transforms in the media query.

---

## RTL Support

Site runs LTR (English, Russian) and RTL (Hebrew, Arabic) at runtime - `dir` attribute set on `<html>` from `dirFromLocale()`.

**Required (Principle 6 - applies in every component):**

- Use Tailwind logical utilities - `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end` - instead of `pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*`, `text-left`, `text-right`.
- Use CSS logical properties - `inset-inline-start/end`, `padding-inline`, `margin-inline-start` - instead of physical equivalents.
- For direction-conditional styles, use Tailwind's `rtl:` / `ltr:` variants (e.g. `rtl:rotate-180` to flip a chevron).

**Block shadows mirror direction**: handled in `globals.css` via `:dir(rtl) .shadow-block { box-shadow: -4px 4px 0 var(--ink); }`. Don't write per-direction shadow code in components.

**Directional icons** (chevrons, back arrows): use the `rtl:rotate-180` variant for symmetric arrows. For asymmetric icons, swap the component conditionally.

**Sanctioned physical exceptions** (don't refactor):

- Symmetric decorative shapes whose left/right placement is visually balanced.
- Full-bleed fixed positioning (`top-0 left-0 right-0` on a full-width header).
- Centered transforms (`left-1/2 -translate-x-1/2` for centered overlays).

---

## Accessibility Defaults

- All interactive elements get a visible `:focus-visible` ring - `outline: 3px solid color-mix(in oklch, var(--ink) 50%, transparent); outline-offset: 4px;`.
- Decorative SVGs/shapes: `aria-hidden`.
- Icon-only buttons: `aria-label` required.
- Color contrast: body copy is `text-ink` on `bg-paper` (≥ 12:1). Secondary copy is `text-ink-soft` (≥ 4.5:1). Never gray-on-gray.
- External links open with `target="_blank" rel="noopener"`.
- Tap targets ≥ 44×44px on mobile - buttons default to `min-h-11`.

---

## Mobile-first rules

- Section padding: `px-4 py-12` mobile → `sm:px-6 sm:py-16` → `lg:py-24`.
- Hero headline: `text-4xl` mobile → `sm:text-5xl` → `md:text-6xl`. Don't go to `text-7xl` - Bagel Fat One overflows on 360px.
- Header: `h-14` mobile, `sm:h-16`. Nav collapses into a sheet below `md`. Branch + locale switchers stay visible at all sizes (icon-only on mobile).
- Floating WhatsApp: bottom-end, 56×56, never overlaps primary CTAs (mind `pb-safe`).
- Grids: single column default, `sm:grid-cols-2`, `lg:grid-cols-3`. Never start at 3-col.
- Buttons in a hero stack vertically on mobile (`flex-col items-stretch`), wrap horizontally `sm:flex-row sm:flex-wrap`.

---

## Tooling

- **Tailwind CSS v4** - no `tailwind.config.js`. All design tokens live in the `@theme` block of `app/globals.css`.
- **Next.js 16** App Router, `proxy.ts` (not `middleware.ts`).
- **next-intl v4** for i18n (`defineRouting`, `getRequestConfig`, `setRequestLocale`).
- **shadcn `base-lyra`** style - components use `@base-ui/react` primitives with `render` prop (NOT `asChild`).
- **`@tabler/icons-react`** for all iconography. Don't introduce a second icon set.

---

## What we removed (and why)

Tracked here so we don't drift back into the AI-slop look:

- `text-glow`, `shadow-glow*` - the reference is letterpress, not LED.
- `bg-gradient-*`, `blur-3xl` background blobs - modern AI-app cliché, opposite of 70s print.
- `backdrop-blur-*` on header / chips - glassmorphism reads as 2020s SaaS.
- Body radial-gradient backgrounds - paper, not aurora.
- `rounded-3xl` on every surface - bubble-y. Use `rounded-2xl` for cards, `rounded-xl` for buttons.
- Multi-stop hero buttons (gradient backgrounds, ring shadows, scale-on-hover) - replaced with the press-into-shadow pattern.

---

## Maintenance

Update this file when you:

- Add a color token, font, or typography size.
- Extract a new shared component (add it to the table above).
- Change a signature pattern (cards, dark sections, CTA style, etc.).
- Add a new page-level archetype.
- Change motion/animation conventions.
- Add or rename a homepage section.

Outdated rules are worse than no rules. If the code disagrees with this file, fix this file before writing more code.
