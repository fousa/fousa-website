# fousa architecture

Personal portfolio site at fousa.be. Longer-form companion to the README: the
*why* behind the structure, not a file-by-file index.

## Stack & conventions

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Sanity v5 ·
Vercel. `@/*` resolves to `src/*`. House rules:

- One concept per file; no god-modules.
- Top-of-file JSDoc on every TS/TSX file; non-trivial functions get full JSDoc
  (`@param`/`@returns`, the *why*).
- Sanity schema fields use the `description` prop so the Studio is self-explaining.
- Tailwind utility-first; design tokens live in `globals.css` via `@theme inline`.
- Conventional Commits; one logical change per commit.

## Design system — minimal-modern

Class-based dark mode (`.dark` on `<html>`, persisted to `localStorage`; an inline
script in the root layout sets it pre-paint to avoid flash). Tokens are CSS custom
properties in `globals.css` mapped to Tailwind via `@theme inline`. Core rules:

- **One accent** (coral): links, arrows, the live status dot, active-filter wash,
  the brand period. Nothing else competes for it.
- **Hairlines, not boxes**: 1px `border-line` + whitespace; no shadows or filled
  cards (the About contact panel `bg-panel` is the single exception).
- **Type roles**: Space Grotesk (display/nav), Inter (body), Space Mono (data/eyebrows).
- **State = dot + word**, never a pill. Coral dot only for `active`; faint grey otherwise.

Motion is deliberately small and compositor-friendly (≤280ms, no layout shift): a
coral hover-arrow on detail rows, an `active`-dot pulse, a `grid-template-rows`
expand for row bodies, and a keyed cross-fade when the filter set changes. A global
`prefers-reduced-motion` rule collapses all of it to near-zero.

## Content model

Seven Sanity document types — four singletons (pinned at the top of the Studio nav)
and three collections.

**Singletons**
- **Profile** — name, `roleLine`, `filterIntro`, bio (portable text), portrait,
  beyond-code items, per-locale CV files, contact + social details.
- **Availability** — status (`available` / `after-hours` / `unavailable`) + a
  localized message; drives the coloured dot in the About contact panel.
- **Site settings** — email, ordered social links, localized meta description, OG override.
- **Empty states** — optional per-filter-combo overrides for the project-log empty state.

**Collections**
- **Timeline entry** — a row on the About career list (freelance / employed /
  education, by `group`); `startDate`/`endDate` drive tenure. Also referenced by
  Project as its employer (its display name is `organisation`, not `name`).
- **Stack tag** — technology labels (Swift, Rails, …), seeded via `pnpm seed:stack-tags`.
- **Project** — the workhorse: one homepage log row *and* one detail page.
  `engagement` (freelance/full-time/internship/student) drives filters; `state`
  (active/maintained/archived/cancelled) drives the status dot (only `active` is
  coral). `year` plus an optional `endYear` render a range in the log — start and
  end on one line with the same faint arrow the "For" column uses (`2020 → 2022`),
  `2022` for a single year. Ongoing work (active/maintained with no `endYear`,
  derived not flagged) shows just its start year; the status dot already signals
  it's still live.
  Detail depth is derived from content — `body` → full case study,
  `gallery` → framed screenshots, neither → no detail page.

Translatable fields are `{ en, nl }` objects (helpers in `sanity/fields/i18n.ts`),
so both locales sit side by side in one document and Dutch falls back to English
when empty. Static UI chrome lives in `i18n/messages.ts` via the typed `t(locale, key)`.

## Routing & i18n

English is the unprefixed default; Dutch lives under `/nl`. The URL alone decides
the language — no browser detection, no cookies. `src/proxy.ts` rewrites unprefixed
paths to `[locale]=en` internally and 308-redirects to canonical forms.

- `/`, `/about`, `/work/<slug>` → English (canonical); `/nl/...` → Dutch.
- `/<slug>` (and `/nl/<slug>`) → 308 to `/work/<slug>` — collapses a legacy duplicate route.
- `/en/...` → 308 to the unprefixed equivalent.
- `/studio` → embedded Sanity Studio (no locale prefix). `/api/revalidate` → webhook.

Internal links use `localizedHref(locale, path)` (`lib/href.ts`); metadata uses
`altMetadata(locale, path)` (`lib/seo.ts`) for canonical + hreflang (`x-default` = English).

## Component map

Grouped by domain under `src/components/`:

- **work/** — `ProjectLog` (filterable table/cards with expand-in-place rows),
  `EmptyState`, `Frame` (hairline device frames for galleries), `StatusDot`, `ToolingChip`.
- **layout/** — `TopBar` (scroll-revealed hairline + blur), `SiteFooter`, `LocaleSwitch`,
  `InfoTip`, `OutboundLink`, `use-scrolled`.
- **about/** — `CareerTimeline`, `AvailabilityBadge`.
- **home/** `HomeLead` · **theme/** `ThemeToggle` · **brand/** `Wordmark` · **seo/** `JsonLd`.

The content layer is `lib/work.ts` (typed `Project`, GROQ fetchers, `projectDepth`,
`matchesFilters`, plus the sort model `compareProjects` / `sortProjects`) plus
`lib/work-display.ts` (`forLabel` — the single source for the "For" label from
employer + client). `mapProjectBase` is the one mapper for the fields the log row
and the detail page share (slug/name/employer/stack/year/locale-resolved summary…),
so the two never drift. `getProjects` builds log `Project`s from it; the detail page
calls one `getProjectDetail(slug, locale)` that returns a `ProjectDetail` (the base
plus `body`, `cover`, `deck`, external `links`, and `related`) — no second raw fetch.
The detail page renders any present live / GitHub / write-up links via `OutboundLink`
(`outbound_click` kinds `live` / `github` / `writeup`). Filtering is six chips in three groups — **stack**
(`apple` | `web`), **status** (`active`), **affiliation**
(`freelance` | `icapps` | `10to1`) — OR within a group, AND across groups, all
URL-backed via `useSearchParams`. The per-helper rules live in their JSDoc.

**Sorting** is desktop-only: the **Project**, **Year**, and **State** column headers
toggle asc⇄desc, persisted as `?s=<key>-<dir>` (omitted when it equals the default).
`DEFAULT_SORT` is `year` desc, and `compareProjects` always falls back to the same
deterministic chain — year desc → state rank → name (`localeCompare`) — so ties are
stable and "no sort" equals that chain with no special casing. The Year sort keys off
`effectiveEndYear` (explicit `endYear`, else `+Infinity` for ongoing, else start year),
so ongoing projects lead; comparisons use sign rather than subtraction to dodge the
`Infinity − Infinity = NaN` trap. `sortProjects` never mutates its input. Rows are
filtered first, then sorted. Mobile renders the same sorted `rows` with no sort UI, so
a shared `?s=` link still orders correctly.

## Accessibility decisions

Targets practical access for keyboard, screen-reader, and 200%-zoom users rather
than formal WCAG certification:

- **Contrast**: `text-muted` clears 4.5:1 on both themes and carries all
  reading/data/interactive copy; `text-faint` is reserved for large mono eyebrows
  and `aria-hidden` separators. Light-mode accent darkened to `#e13100` (4.53:1 on white).
- **Keyboard rows**: the desktop log row is a `role="button"` `<tr>` with Enter/Space
  activation and a `focus-visible` ring; collapsed expand-bodies get `inert` to stay
  out of the tab order. Both desktop and mobile toggles expose `aria-expanded`.
- **Live regions**: the filtered-count line and empty state use
  `role="status" aria-live="polite"` so filter changes are announced.
- **Sortable headers**: each sortable `<th>` carries `aria-sort`
  (`ascending`/`descending` on the active column, `none` otherwise); the ↑/↓/↕ caret
  is `aria-hidden`, and the header button shares the rows' `focus-visible` ring.
- **Decorative glyphs** (arrows, dots) are `aria-hidden`; the label/word carries meaning.
- **Focus management**: the mobile menu traps + restores focus, closes on Escape,
  and is wired with `aria-controls` + a localized label.
- **Touch targets**: small controls extend to ~44px via an `::after` hit area without
  changing visual size.
- **Skip link** in the root layout jumps to the single `<main id="main">` landmark per route.

## SEO surface

- **Base** — root layout sets `metadataBase` (`https://fousa.be`) and a
  `%s · fousa.be` title template, plus default Open Graph / Twitter cards.
- **robots.txt** (`app/robots.ts`) allows all, blocks `/studio/`, points at the sitemap.
- **sitemap.xml** (`app/sitemap.ts`) lists both locales of `/`, `/about`, and every
  case study with a body or gallery (depth-`none` projects 404, so they're excluded).
- **JSON-LD** (`components/seo/JsonLd.tsx`) emits a site-wide `Person` and a per-case-study
  `CreativeWork` (`lib/json-ld.ts`), escaping `<` to prevent tag breakout.
- **Per-page OG** — case studies override the share image with the generated
  `/og/<slug>` card; everything else inherits the site default.

## Testing

A foundation to grow, not full coverage. Two layers:

- **Unit / component (Vitest + RTL, jsdom).** Pure helpers carry most of the logic
  and are tested directly: `forLabel`, `projectDepth` + `matchesFilters`,
  `altMetadata`, `pathParts` + `hrefFor`. One component test (`ProjectLog`) covers
  keyboard row-expansion and the empty state. `vitest.setup.ts` stubs the public
  Sanity env vars so `sanity/env.ts` doesn't throw at import.
- **E2E (Playwright, Chromium, against a production build).** Three journeys: filter
  the work log, expand a row + follow a case-study CTA when one exists (data-driven),
  and toggle theme + switch locale without losing scroll.

Not covered: Sanity schemas, layout chrome, visual regression — left out to keep the
suite fast. Run `pnpm test` (unit) and `pnpm build && pnpm test:e2e` (E2E); CI runs
both on push and PR.

## Operational notes

- **Rendering** — SSG with on-demand ISR. Pages build at deploy time; a Sanity
  webhook hits `/api/revalidate` (guarded by `SANITY_REVALIDATE_SECRET`) which calls
  `revalidatePath` for the affected routes. Visitors always get CDN-cached HTML.
- **Deploys** — Vercel, automatic on `main`. CI (`.github/workflows/test.yml`) needs
  `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_API_TOKEN`
  as repository secrets for build + E2E.
- **Analytics** — Vercel Analytics (cookie-less), mounted once in the locale layout.
  Custom events go through the typed `track()` wrapper (`lib/analytics.ts`):
  `project_expand`, `project_open`, `filter_select`, `sort_change`,
  `empty_state_shown`, `locale_switch`, `theme_toggle`, `outbound_click`.
