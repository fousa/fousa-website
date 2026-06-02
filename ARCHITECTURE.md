# fousa architecture

Personal portfolio site at fousa.be. Next.js 16 (App Router) + Sanity v5 + Tailwind v4 + Vercel.

## Directory layout

```
fousa/
├── ARCHITECTURE.md           ← you are here
├── sanity.config.ts          ← Sanity Studio config (mounted at /studio)
├── next.config.ts            ← Next.js config (image domains, etc.)
├── scripts/                  ← one-shot maintenance scripts
│   └── seed-stack-tags.ts    ← seed initial Stack tag documents
└── src/
    ├── proxy.ts             ← locale detection + redirect (edge proxy)
    ├── app/
    │   ├── layout.tsx        ← root layout (fonts, metadata, no-flash script)
    │   ├── globals.css       ← design tokens + base layer (minimal-modern)
    │   ├── [locale]/
    │   │   ├── layout.tsx    ← locale validation + TopBar
    │   │   ├── page.tsx      ← homepage (project log)
    │   │   ├── not-found.tsx ← 404 ("drifted off the map")
    │   │   ├── about/
    │   │   │   └── page.tsx  ← about (hero, career, beyond code, contact)
    │   │   ├── work/
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx ← case study page
    │   │   └── [slug]/
    │   │       ├── page.tsx  ← legacy case study route (Sanity-connected)
    │   │       └── not-found.tsx
    │   ├── studio/
    │   │   └── [[...tool]]/page.tsx  ← Sanity Studio mount
    │   └── api/
    │       └── revalidate/route.ts   ← Sanity webhook → ISR revalidation
    ├── i18n/
    │   ├── config.ts         ← supported locales + helpers
    │   ├── messages.ts       ← static UI strings (EN/NL) for all components
    │   └── pick-locale.ts    ← Sanity field locale picker with fallback
    ├── sanity/
    │   ├── client.ts         ← Sanity client + image URL builder
    │   ├── env.ts            ← env var loading with assertions
    │   ├── fetch.ts          ← server-side fetch wrapper (1h ISR)
    │   ├── structure.ts      ← Studio desk structure (pinned singletons)
    │   ├── schemas/
    │   │   ├── index.ts      ← barrel; add new schemas here
    │   │   ├── profile.ts    ← singleton: bio, contact, CV
    │   │   ├── availability.ts ← singleton: status + message
    │   │   ├── site-settings.ts ← singleton: email, socials, SEO
    │   │   ├── empty-states.ts ← singleton: per-filter-combo empty-state overrides
    │   │   ├── employer.ts   ← career timeline rows
    │   │   ├── stack-tag.ts  ← Swift, Rails, etc.
    │   │   └── project.ts    ← the workhorse — log row + case study
    │   ├── fields/
    │   │   └── i18n.ts       ← i18nString / i18nText / i18nPortableText
    │   └── queries/          ← GROQ queries for each page
    ├── components/
    │   ├── theme/
    │   │   └── ThemeToggle.tsx  ← dark-mode toggle (localStorage + .dark class)
    │   ├── layout/
    │   │   ├── TopBar.tsx       ← sticky header (wordmark, nav, hamburger); scroll-revealed hairline + blur
    │   │   ├── use-scrolled.ts  ← IntersectionObserver hook: true once a sentinel leaves the viewport
    │   │   ├── SiteFooter.tsx   ← copyright + inline privacy info tip, locale switch, theme toggle
    │   │   ├── InfoTip.tsx      ← hover/focus + tap-toggle popover ("i" affordance)
    │   │   ├── LocaleSwitch.tsx ← responsive EN/NL switch (full names desktop, codes mobile)
    │   │   └── OutboundLink.tsx ← <a> wrapper that fires outbound_click analytics event
    │   ├── work/
    │   │   ├── ProjectLog.tsx   ← filterable project table/cards with expand
    │   │   ├── EmptyState.tsx   ← "no projects match" panel (brand mark + headline + actions)
    │   │   ├── ToolingChip.tsx  ← outline "AI-assisted" pill, shown when featureTooling is true
    │   │   └── StatusDot.tsx    ← dot + word status indicator
    │   ├── about/
    │   │   ├── AvailabilityBadge.tsx ← coloured dot + label for contact panel
    │   │   └── …                ← legacy Sanity-connected about components
    │   ├── locale-switcher.tsx  ← EN/NL path-swap toggle
    │   ├── log/                 ← legacy Sanity-connected log components
    │   └── case-study/          ← legacy Sanity-connected case study components
    ├── lib/
    │   ├── work.ts              ← Project type, filters, getProjects/getProject
    │   ├── analytics.ts         ← typed track() wrapper over @vercel/analytics
    │   ├── href.ts              ← localizedHref() — unprefixed en, /nl for Dutch
    │   ├── seo.ts               ← altMetadata() — canonical + hreflang alternates
    │   ├── format-year-range.ts ← format year or year range
    │   └── json-ld.ts           ← Schema.org JSON-LD builders
    └── hooks/
        └── use-expanded-slug.ts ← hash sync for expanded rows
```

## Design system — minimal-modern

Class-based dark mode (`.dark` on `<html>`). Tokens in `globals.css` via CSS custom properties mapped to Tailwind via `@theme inline`. Key rules:

- **One accent** (coral): links + arrows, live dot, active filter underline, brand period
- **Hairlines, not boxes**: 1px `border-line` + whitespace, no shadows or filled cards (except the About contact panel `bg-panel`)
- **Type roles**: Space Grotesk (display/headings/nav), Inter (body), Space Mono (data/eyebrow labels)
- **State = dot + word**, never a pill. Coral dot only for `active`; faint grey for all others

Theme toggle persists to `localStorage`; an inline script in the root layout prevents flash on reload.

## Content model

Seven document types. Four singletons (Profile, Availability, Site Settings, Empty states) edited in place from the pinned top of the Studio nav. Three collections (Employer, Stack tag, Project) — Project references Employer and Stack tag.

### Singletons
- **Profile**: name (plain string, shown large on the homepage with the coral brand period), roleLine (i18n — one-line subtitle), filterIntro (i18n — invitation to explore the log), plus tagline, about headline, bio (portable text), portrait, beyond-code list, per-locale CV files (EN + NL), location, email, social links, VAT, copyright year. The `HomeLead` component (`components/home/HomeLead.tsx`) renders name/role/filterIntro on the homepage; about page uses bio/portrait/beyond-code.
- **Availability**: status enum (`available` / `after-hours` / `unavailable`) plus a localized `message` shown next to the coloured dot. Rendered in the about page contact panel (green = available, amber = after-hours, red = full).
- **Site Settings**: global email, ordered social links (platform + URL + label), localized meta description, OG image override. Social links render in the about page contact panel.
- **Empty states**: an optional list of hand-written overrides for the project-log empty state. Each entry holds a set of filter keys (`apple`, `web`, `active`, `freelance`, `icapps`, `10to1`) plus a localized headline + body. When the active filter set matches an entry exactly (order-independent, first match wins), its copy replaces the universal dictionary copy. Keep the list short — two or three combos; everything else falls back.

### Collections
- **Timeline entry** (`timelineEntry`): a single row on the About career list. Covers freelance, employed, and education entries, discriminated by `group`. Uses `startDate`/`endDate` (date, month precision) for tenure; ongoing entries (no `endDate`) get the coral live dot. Also referenced by Project via the `employer` field.
- **Stack tag**: technology labels (Swift, Rails, etc.) with `name` and `slug`. Referenced by Project; pre-seeded via `pnpm seed:stack-tags`.
- **Project**: the workhorse. Each Project is a row in the homepage log AND a detail page. Two ownership fields: `employer` (reference, shown only when engagement = full-time or internship) and `client` (string, the end customer). `engagement` (freelance/full-time/internship/student) drives homepage filters. `state` (active/maintained/archived/cancelled) drives the colored status dot — only `active` shows the coral accent. Three depth levels derived automatically from content: `full` (has body → case study), `gallery` (has gallery images → screenshot page with device frames), or `none` (no detail page). Gallery images each pick a frame (phone/tablet/browser/none). Optional `tooling` (i18nString) describes how the project was built — shown as a mono meta-line in the expanded zone. `featureTooling` (boolean) opts in for a subtle "AI-assisted" chip next to the name in the log. Also includes summary, body, cover, and grouped into Basics / Case study / Links tabs.

## Content layer (`lib/work.ts` + `lib/work-display.ts`)

Typed `Project` interface backed by Sanity GROQ queries — `getProjects` / `getProject` / `getProjectSlugs` fetch and normalize Sanity data into the flat `Project` shape the components expect. `getEmptyStates(locale)` fetches the optional empty-state overrides (resolving each entry's headline/body to the active locale). Project `state`: active/maintained/archived/cancelled — only `active` gets the coral accent dot.

### Filtering (`lib/work.ts`)

Six chips in three groups, multi-select. OR within a group, AND across groups:

- **stack** — `apple` | `web`: matches projects with any tag in the corresponding set. `APPLE_TAGS`: iOS, iPadOS, macOS, watchOS, Swift, SwiftUI. `WEB_TAGS`: Website, Ruby on Rails, Node, API, Next.js. Extend these sets when a new platform is added. Compared against the stack tag's `slug` field (case/space-insensitive).
- **status** — `active`: matches ongoing projects (no `endYear` set).
- **affiliation** — `freelance` | `icapps` | `10to1`: mutually exclusive per project. `freelance` checks `engagement === 'freelance'`; `icapps` / `10to1` check `employerSlug` (projected as `lower(organisation)` from the employer `timelineEntry` in the GROQ query).

Stack-tag `category` has been removed. Stack chips use a single neutral style; hero and OG fallback backgrounds use a flat dark tone.

Filter state is URL-backed via `useSearchParams` in `ProjectLog.tsx` (`?stack=apple&status=active&affiliation=freelance,icapps`). When filters are active, a row of soft coral pills appears above the chip bar with inline "Clear all"; the chip bar itself uses a coral wash (`bg-accent-soft` / `text-accent-deep`) on active chips. A filtered count is shown below the list.

When active filters yield zero projects, the table/cards are replaced by the `EmptyState` component (`components/work/EmptyState.tsx`): the hairline `f.` brand mark, a headline + one-paragraph body, and "Clear filters →" plus a muted "or browse all projects" hint. Universal copy lives in the i18n dictionary (`empty.*` keys); per-combination overrides live in the Empty states singleton and win when the active filter set matches exactly. The empty state is only shown when filters are active — an empty list with no filters means the dataset itself is empty.

`forLabel()` in `work-display.ts` derives the "For" column from employer + client: "employer → client" when both exist, a single name when one, or "Personal" as fallback. `projectDepth()` derives `full` / `gallery` / `none` from content — no manual field. The `Frame` component (`components/work/Frame.tsx`) renders minimal hairline device frames (phone/tablet/browser) around gallery screenshots.

## i18n

Field-level translations, not document-level. Translatable fields (deck, description, outcome, etc.) are objects with `en` and `nl` sub-fields, built via the helpers in `src/sanity/fields/i18n.ts`. Both locales live in the same document so editors can compare them side by side.

Static UI strings live in `src/i18n/messages.ts` with EN and NL translations for nav labels, filter names, and component chrome. Content copy (headlines, bios, beyond-code items) lives in Sanity. The `t(locale, key)` helper provides typed lookups; Sanity fields fall back to `t()` values when empty.

At render time, missing Dutch fields fall back to English. The Next.js side reads `locale` from the URL and picks the right sub-field.

## Routing

English is the unprefixed default locale; Dutch lives under `/nl`. No browser-locale detection, no cookies — the URL alone determines the language. The proxy rewrites unprefixed paths to `[locale]=en` internally and 308-redirects `/en/...` to the unprefixed canonical form.

- `/`, `/about`, `/work/<slug>` → English (canonical)
- `/nl`, `/nl/about`, `/nl/work/<slug>` → Dutch
- `/<slug>`, `/nl/<slug>` → legacy case study route (Sanity-connected)
- `/en/...` → 308 redirect to unprefixed equivalent
- `/studio` → Sanity Studio (no locale prefix — admin only)
- `/api/revalidate` → webhook endpoint, requires `?secret=` query param

All internal links use `localizedHref(locale, path)` from `lib/href.ts`. SEO metadata uses `altMetadata(locale, path)` from `lib/seo.ts` for canonical + hreflang (`x-default` points at English).

## Rendering

SSG with on-demand ISR. Pages build at deploy time; Sanity webhook hits `/api/revalidate` whenever content changes, which calls `revalidatePath` for the affected routes. Visitors always get a CDN-cached HTML response.

## Analytics

Vercel Analytics (cookie-less, no consent banner). Mounted once in the locale layout via `<Analytics />`. Custom events emitted through the typed `track()` wrapper in `lib/analytics.ts`:

| Event | Source | Properties |
|---|---|---|
| `project_expand` | ProjectLog | slug, depth, locale |
| `project_open` | ProjectLog (DepthLink) | slug, depth, target, locale |
| `filter_select` | ProjectLog | filter, locale |
| `empty_state_shown` | ProjectLog | filters, locale |
| `locale_switch` | LocaleSwitch | from, to, path |
| `theme_toggle` | ThemeToggle | to |
| `outbound_click` | OutboundLink | kind, href, locale |

## Conventions

- One concept per file. No god-modules.
- Top-of-file JSDoc block on every TS/TSX file explaining what it is and why.
- Non-trivial functions get full JSDoc (`@param`, `@returns`, why-not-just-what).
- Schema fields use the `description` prop so the Studio explains itself.
- Conventional Commits for every commit.
- Tailwind utility-first; design tokens via CSS `@theme inline` in globals.css.
