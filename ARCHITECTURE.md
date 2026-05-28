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
    ├── middleware.ts         ← locale detection + redirect
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
    │   │   ├── availability.ts ← singleton: status pill
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
    │   │   └── TopBar.tsx       ← site header (wordmark, nav, locale, theme, hamburger)
    │   ├── work/
    │   │   ├── ProjectLog.tsx   ← filterable project table/cards with expand
    │   │   └── StatusDot.tsx    ← dot + word status indicator
    │   ├── locale-switcher.tsx  ← EN/NL path-swap toggle
    │   ├── log/                 ← legacy Sanity-connected log components
    │   ├── about/               ← legacy Sanity-connected about components
    │   └── case-study/          ← legacy Sanity-connected case study components
    ├── lib/
    │   ├── work.ts              ← Project type, filters, getProjects/getProject
    │   ├── filter-projects.ts   ← stack category + engagement filtering (Sanity)
    │   ├── employer-filters.ts  ← derive dominant stack per employer
    │   ├── format-year-range.ts ← format year or year range
    │   └── json-ld.ts           ← Schema.org JSON-LD builders
    └── hooks/
        ├── use-expanded-slug.ts ← hash sync for expanded rows
        └── use-filter-state.ts  ← filter state management
```

## Design system — minimal-modern

Class-based dark mode (`.dark` on `<html>`). Tokens in `globals.css` via CSS custom properties mapped to Tailwind via `@theme inline`. Key rules:

- **One accent** (coral): links + arrows, live dot, active filter underline, brand period
- **Hairlines, not boxes**: 1px `border-line` + whitespace, no shadows or filled cards (except the About contact panel `bg-panel`)
- **Type roles**: Space Grotesk (display/headings/nav), Inter (body), Space Mono (data/eyebrow labels)
- **Status = dot + word**, never a pill

Theme toggle persists to `localStorage`; an inline script in the root layout prevents flash on reload.

## Content model

Five document types. Two singletons (Profile, Availability) edited in place from the pinned top of the Studio nav. Three collections (Employer, Stack tag, Project) — Project references Employer and Stack tag.

### Singletons
- **Profile**: bio, photo, contact links, CV file, VAT number. Rendered on the about page hero and the site footer.
- **Availability**: status pill driven by an enum (`available` / `booked` / `next-opening`) plus a label string. Rendered in the top bar on every page.

### Collections
- **Employer**: every job and freelance entity. Drives the career timeline on the about page. Projects reference an Employer so the timeline can show what was built where.
- **Stack tag**: technology labels (Swift, Rails, etc.). Referenced by Project; pre-seeded via `pnpm seed:stack-tags`.
- **Project**: the workhorse. Each Project is a row in the homepage log AND a case study panel that expands inline. Fields are grouped into Basics / Case study / Links tabs. Most case-study fields are optional — thin projects render as rows-only.

## Content layer (`lib/work.ts`)

Typed `Project` interface and filter helpers. Currently backed by static sample data; swap `getProjects`/`getProject` bodies for GROQ queries when ready — the component interface stays identical.

## i18n

Field-level translations, not document-level. Translatable fields (deck, description, outcome, etc.) are objects with `en` and `nl` sub-fields, built via the helpers in `src/sanity/fields/i18n.ts`. Both locales live in the same document so editors can compare them side by side.

Static UI strings live in `src/i18n/messages.ts` with EN and NL translations for all nav labels, filter names, page copy, and component text. The `t(locale, key)` helper provides typed lookups.

At render time, missing Dutch fields fall back to English. The Next.js side reads `locale` from the URL (`/en` or `/nl`) and picks the right sub-field.

## Routing

- `/` → middleware redirects to `/en` or `/nl` based on cookie / `Accept-Language`
- `/en`, `/nl` → the log (homepage)
- `/en/about`, `/nl/about` → about page
- `/en/work/<slug>`, `/nl/work/<slug>` → case study page (minimal-modern)
- `/en/<slug>`, `/nl/<slug>` → legacy case study route (Sanity-connected)
- `/studio` → Sanity Studio (no locale prefix — admin only)
- `/api/revalidate` → webhook endpoint, requires `?secret=` query param

## Rendering

SSG with on-demand ISR. Pages build at deploy time; Sanity webhook hits `/api/revalidate` whenever content changes, which calls `revalidatePath` for the affected routes. Visitors always get a CDN-cached HTML response.

## Conventions

- One concept per file. No god-modules.
- Top-of-file JSDoc block on every TS/TSX file explaining what it is and why.
- Non-trivial functions get full JSDoc (`@param`, `@returns`, why-not-just-what).
- Schema fields use the `description` prop so the Studio explains itself.
- Conventional Commits for every commit.
- Tailwind utility-first; design tokens via CSS `@theme inline` in globals.css.
