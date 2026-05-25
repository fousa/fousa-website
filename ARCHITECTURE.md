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
    │   ├── layout.tsx        ← root layout (html, body, base styles)
    │   ├── globals.css       ← Tailwind import
    │   ├── [locale]/
    │   │   ├── layout.tsx    ← locale validation + passthrough
    │   │   └── page.tsx      ← homepage (the log) — Phase 3
    │   ├── studio/
    │   │   └── [[...tool]]/page.tsx  ← Sanity Studio mount
    │   └── api/
    │       └── revalidate/route.ts   ← Sanity webhook → ISR revalidation
    ├── i18n/
    │   └── config.ts         ← supported locales + helpers
    └── sanity/
        ├── client.ts         ← Sanity client + image URL builder
        ├── env.ts            ← env var loading with assertions
        ├── structure.ts      ← Studio desk structure (pinned singletons)
        ├── schemas/
        │   ├── index.ts      ← barrel; add new schemas here
        │   ├── profile.ts        ← singleton: bio, contact, CV
        │   ├── availability.ts   ← singleton: status pill
        │   ├── employer.ts       ← career timeline rows
        │   ├── stack-tag.ts      ← Swift, Rails, etc.
        │   └── project.ts        ← the workhorse — log row + case study
        └── fields/
            └── i18n.ts       ← i18nString / i18nText / i18nPortableText
```

## Content model

Five document types. Two singletons (Profile, Availability) edited in place from the pinned top of the Studio nav. Three collections (Employer, Stack tag, Project) — Project references Employer and Stack tag.

### Singletons
- **Profile**: bio, photo, contact links, CV file, VAT number. Rendered on the about page hero and the site footer.
- **Availability**: status pill driven by an enum (`available` / `booked` / `next-opening`) plus a label string. Rendered in the top bar on every page.

### Collections
- **Employer**: every job and freelance entity. Drives the career timeline on the about page. Projects reference an Employer so the timeline can show what was built where.
- **Stack tag**: technology labels (Swift, Rails, etc.). Referenced by Project; pre-seeded via `pnpm seed:stack-tags`.
- **Project**: the workhorse. Each Project is a row in the homepage log AND a case study panel that expands inline. Fields are grouped into Basics / Case study / Links tabs. Most case-study fields are optional — thin projects render as rows-only.

## i18n

Field-level translations, not document-level. Translatable fields (deck, description, outcome, etc.) are objects with `en` and `nl` sub-fields, built via the helpers in `src/sanity/fields/i18n.ts`. Both locales live in the same document so editors can compare them side by side. The `documentInternationalization` plugin is enabled with the language list but its `schemaTypes` array is intentionally empty — we don't split documents by language.

At render time, missing Dutch fields fall back to English. The Next.js side reads `locale` from the URL (`/en` or `/nl`) and picks the right sub-field.

## Routing

- `/` → middleware redirects to `/en` or `/nl` based on cookie / `Accept-Language`
- `/en`, `/nl` → the log (homepage)
- `/en/about`, `/nl/about` → about page
- `/en/<slug>`, `/nl/<slug>` → standalone case study pages
- `/en/#<slug>`, `/nl/#<slug>` → homepage with that row pre-expanded (same content, different chrome)
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
- Tailwind utility-first; no `tailwind.config.js` (Tailwind v4 uses CSS `@theme`).
