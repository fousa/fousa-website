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
  `gallery` → framed screenshots, neither → no detail page. Rows with depth
  carry a **depth marker** (`DepthIcon`) next to the name: a document glyph for a
  full case study, stacked frames for a screenshots-only gallery, nothing for a
  bare/tool row. The icon is absolutely positioned in the whitespace left of the
  name and slides into that margin on row hover (so the name never shifts); on
  touch devices (`hover: none`) it sits inline before the name, always visible
  and faint. The **Case study** filter chip still keys off `hasCaseStudy` (depth
  `full`). A depth-`none`
  project that carries an external link (`githubUrl` / `liveUrl`) surfaces
  "Source ↗" / "Open ↗" in its log row instead of an internal CTA — derived from
  depth + links, no flag. The "Tool" *label* in the "For" column is separate and
  is a manual `isTool` boolean (see below): too many case-study-less personal
  projects carry a link without being a tool, so the call is the editor's.

Translatable fields are `{ en, nl }` objects (helpers in `sanity/fields/i18n.ts`),
so both locales sit side by side in one document and Dutch falls back to English
when empty. Static UI chrome lives in `i18n/messages.ts` via the typed `t(locale, key)`.

## Routing & i18n

English is the unprefixed default; Dutch lives under `/nl`. The URL alone decides
the language — no browser detection, no cookies. `src/proxy.ts` rewrites unprefixed
paths to `[locale]=en` internally and 308-redirects to canonical forms.

- `/`, `/about`, `/gallery`, `/work/<slug>` → English (canonical); `/nl/...` → Dutch.
- `/<slug>` (and `/nl/<slug>`) → 308 to `/work/<slug>` — collapses a legacy duplicate route.
- `/en/...` → 308 to the unprefixed equivalent.
- `/studio` → embedded Sanity Studio (no locale prefix). `/api/revalidate` → webhook.

Internal links use `localizedHref(locale, path)` (`lib/href.ts`); metadata uses
`altMetadata(locale, path)` (`lib/seo.ts`) for canonical + hreflang (`x-default` = English).

## Component map

Grouped by domain under `src/components/`:

- **work/** — `ProjectLog` (filterable table/cards with expand-in-place rows),
  `EmptyState`, `Frame` (hairline device frames for galleries: phone, tablet-landscape
  (4:3) / tablet-portrait (3:4) — same iPad bezel in two orientations, tv (16:9
  chrome-less bezel with a small centered stand), Apple
  Watch, browser, none), `Gallery` (screenshots grouped by device — iPad → iPhone →
  Apple Watch, derived from each shot's `frame` via `lib/gallery-devices`; both tablet
  orientations fall under the iPad group, with a
  built-in fit-to-screen lightbox carousel), `StatusDot`, `ToolingChip`.
- **layout/** — `TopBar` (scroll-revealed hairline + blur), `SiteFooter`, `LocaleSwitch`,
  `InfoTip`, `OutboundLink`, `use-scrolled`.
- **about/** — `CareerTimeline`, `AvailabilityBadge`, `Skills` (numbered
  category index, each tag deep-linking into the filtered log).
- **gallery/** — `GalleryMasonry`, the client masonry behind `/gallery`.
- **home/** `HomeLead` · **theme/** `ThemeToggle` · **brand/** `Wordmark` · **glide/**
  `GlideGame` (the hidden glider mini-game) · **seo/** `JsonLd`.

The wordmark hides an easter egg: on desktop, hovering (or keyboard-focusing) `fousa.be`
in the `TopBar` wipes out a small "take off ✈" link to its right that launches `GlideGame`
— styling lives in the scoped `.brand-unit` / `.reveal-*` block in `globals.css` (motion
collapses under the global `prefers-reduced-motion` safeguard). Touch has no hover, so the
game becomes a regular item in the mobile menu instead. Both entries reuse the one
`GlideGame` trigger (its `children`/`ariaLabel`/`onLaunch` props); the wordmark itself stays
the home link everywhere.

The content layer is `lib/work.ts` (typed `Project`, GROQ fetchers, `projectDepth`,
`matchesFilters`, plus the sort model `compareProjects` / `sortProjects`) plus
`lib/work-display.ts` (`forLabel` — the single source for the "For" label from
employer + client). The manual `isTool` Studio flag is authoritative: when set,
`forLabel` reads "Tool", keeping any employer/client as a "→ Tool" prefix (an
internal icapps tool reads "icapps → Tool"); a standalone utility is just "Tool".
With the flag off it falls back to the relationship label (employer → client, a
single name) or "Personal". The Tool *label* is deliberately manual — separate
from the derived Source-↗ link rule — because too many case-study-less personal
projects carry a link without being a tool. All three render
sites (desktop row, mobile meta, case-study meta) go through the shared `ForCell`
(`components/work/ForCell.tsx`) so the label never drifts. `mapProjectBase` is the one mapper for the fields the log row
and the detail page share (slug/name/employer/stack/year/locale-resolved `deck`…,
plus the external `links` so a tool row can surface them), so the two
never drift. `deck` is the single short pitch: the one-line `deck` shows in the
expanded log row, under the case-study title, and as the SEO/OG description
(falling back to the site description when a project has no deck).
It also derives `platforms` — the stack tags whose skill category is `platform`,
joined for display — which the home log's "Platform" column shows in place of the
full `stack` (the detail page still renders the complete `stack`). Tag a stack
tag's category as **Platform** in Studio to surface it there.
`getProjects` builds log `Project`s from it; the detail page calls one
`getProjectDetail(slug, locale)` that returns a `ProjectDetail` (the base plus
`body`, `cover`, and `related`) — no second raw fetch, and `links` ride
along on the base. Cover and gallery URLs go through the `@sanity/image-url`
builder (`sanity/image.ts` → `urlForImage`), not `asset->url`, so the editor's
crop + hotspot take effect: the cover is a fixed 3:1 hero framed on the hotspot
(`width(1800).height(600).fit('crop')`), while gallery shots honor the crop
region and carry the cropped dimensions so frames aren't stretched. The per-shot
`frame` value `tablet` was split into `tablet-landscape` / `tablet-portrait`; the
old value was migrated to `tablet-landscape` (one-off `scripts/migrate-tablet-frame.ts`).
Both the detail page and tool rows render any present live /
GitHub links via `OutboundLink` (`outbound_click` kinds `live` / `github`).
Filtering is eight curated chips in five groups — **stack**
(`apple` | `web`), **status** (`active`), **tool** (`tools`, placed right after
`active`), **caseStudy** (`casestudy`, placed right after `tools`), **affiliation**
(`freelance` | `icapps` | `10to1`) — plus a sixth,
open-ended **skill** axis (`?skill=swift,ruby-on-rails`): any stack-tag slug, no
allowlist, matched against each project's `tagSlugs`. The two stack chips are
deliberately asymmetric (`matchesStack`): **apple** stays broad — it groups
several Apple-platform tags (iOS, macOS, Swift…) — while **web** is strict,
matching only the explicit `web` platform tag like a skill key (so "web" means
tagged-as-web, not "uses some web tech"). The **tool** axis narrows
to projects that read as "Tool" in the For column; it matches via
`isToolProject` — the same `forLabel`-derived predicate the label uses, so the
chip and the label can never disagree. The **caseStudy** axis narrows to projects
with a full written case study; it matches via `hasCaseStudy` (depth `full`) —
the single predicate that also drives the row's depth marker in the log, so the
chip and the marker can never disagree. OR within a group, AND across groups, all
URL-backed via `useSearchParams` (one param per group). The per-helper rules live
in their JSDoc.
The skill axis powers the About **Skills** section: `lib/skills.ts` / `getSkills`
(query `sanity/queries/skills.ts`) returns every tag used by ≥1 project with its
usage count and its grouping category — a **reference** to a `skillCategory`
document, dereferenced to its key, translatable title, and `orderRank`. Each tag
links to `/?skill=<key>#work`. It renders as a **numbered category index** (layout B,
`components/about/Skills.tsx`): `groupByCategory` buckets tags by their category,
orders groups by each category's `orderRank` (a lexorank string compared
lexically; English title breaks ties), and parks tags with no category reference
under the code-side "Other" bucket (always last) so nothing silently disappears.
Categories, their labels, and their order are therefore **editor-managed** —
adding or renaming one is pure Studio work, and the order is set by **dragging
the rows** in the Studio "Skill categories" list (via
`@sanity/orderable-document-list`, which stores a hidden `orderRank` and renders
the orderable desk item in `sanity/structure.ts`). Only the "Other" label stays
in i18n (`skills.cat.other`), since that bucket has no document. Each category is a
hairline row with a **mono numeral in the left gutter** (`01`, `02`, …); on mobile the
label sits on the first line beside the number and the tags wrap **indented under the
label** (not under the number), while at `md` the row becomes number · label · tags side
by side. Tags are **uniform-size**, ordered most-used first; emphasis is by tone, not
size — `coreKeys` marks the global frequency tier 1–2 (reusing `sizeSkills`' quantiles
over the full set) so the most-used skills render in ink and the long tail dims. Every
tag is shown; the `·` separators are real text (so they wrap with the tags) but
`aria-hidden`.
In the log, an active skill rides **alongside the curated chips** as an extra `Skill ×` chip
(it has no off-state of its own, so clicking removes it); `ProjectLog` takes a
`skillLabels` key→name map so the chip reads "PostgreSQL", not the slug. The log
section carries `id="work"` + `scroll-mt-20` so the `#work` hash lands on the
filtered list below the sticky header.

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

**Search** is a free-text filter over *every* searchable field on a project —
name, client, role, employer organisation, stack tag names, deck, case-study
body, gallery captions, year/end year, state and engagement. The matchable text
is assembled **server-side in GROQ** as a `searchText` projection that
`array::join`s those fields into one `lower(...)` haystack (coalescing localized
fields to English, dereferencing employer/stack, flattening PortableText with
`pt::text`) — so the arrays are joined once at query time and the client
predicate `matchesQuery` is a plain lowercased substring test. It
composes with the chips exactly like another axis: `rows` is
`projects.filter(p => matchesQuery(p, q) && matchesFilters(p, filters))`. The
query lives in the URL as `?q=`, written through a 250 ms `useDebouncedCallback`
(no history spam, `scroll: false`, hash preserved) while a local `liveQuery`
keeps the input responsive ahead of the debounce. The `SearchChip` collapses to a
magnifying-glass icon button at rest and expands to a dark filled pill (borderless
input + × clear) when focused or non-empty, re-collapsing on blur/Escape when
empty. Matches are wrapped in `<mark>` by a module-level `highlight()` helper on
the name and deck in both the desktop row and mobile card. With a query active the
empty state reads "No projects match …{q}…" and its clear action resets `?q=`.

**Cross-project gallery** (`/gallery`) flattens every project's `gallery[]` into
one stream of shots via `lib/gallery.ts` / `getGalleryShots` (query
`sanity/queries/gallery.ts`), tagging each with its project and a coarse device
group from `deviceOf` (phone → iphone, tablet-* → ipad, watch → watch, tv → tv,
browser → web, else → other).
Shots reuse the detail page's image pipeline — both go through the shared
`mapGalleryShot` in `lib/work.ts`, so there's one loader/crop path. The page
carries a home-style header (eyebrow "Gallery", display title "Screenshots." +
coral period, a short description) over `GalleryMasonry`: an absolutely-positioned masonry
whose items glide to new columns on filter (a `transform` transition) while
filtered-out shots fade in place, so nothing jumps; device chips (styled like
the log's filter chips, single-select — re-tapping the active one clears it, with
a "Clear all" link beside them while one is active) drive a shareable `?d=` param
and the glide collapses under the global reduced-motion safeguard. Each shot links to its case study with `?from=gallery`, which the
detail page's **context-aware back link** reads (`searchParams.from`) to show
"← Gallery" → `/gallery`; without the marker it falls back to the project log.

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
- **sitemap.xml** (`app/sitemap.ts`) lists both locales of `/`, `/about`, `/gallery`,
  and every case study with a body or gallery (depth-`none` projects 404, so they're excluded).
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
  Page hits (incl. `/about`) are tracked automatically; custom events go through the
  typed `track()` wrapper (`lib/analytics.ts`): `project_expand`, `project_open`,
  `filter_select`, `sort_change`, `empty_state_shown`, `search_query` (logs the
  query *length* and result count on the debounced commit, never the text),
  `gallery_filter` (the picked device bucket + shot count on the `/gallery` page),
  `locale_switch`, `theme_toggle`, `outbound_click`, `glide_open`, and
  `glide_close` (records `seconds` played and `runs` flown when the mini-game
  overlay closes).
