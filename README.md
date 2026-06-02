# fousa.be

Portfolio site of Frederik Vandebeeck — freelance iOS & web developer.
Next.js 16 App Router · TypeScript · Tailwind v4 · Sanity v5 · pnpm · Vercel.

## Quick start

```bash
pnpm install
pnpm dev               # http://localhost:3000
```

Sanity Studio is embedded in the app — with the dev server running, open
[http://localhost:3000/studio](http://localhost:3000/studio).

Environment: copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity manage → Project settings |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | yes | API date, e.g. `2024-12-01` |
| `SANITY_API_TOKEN` | yes | Sanity → API → Tokens (read scope) |
| `SANITY_REVALIDATE_SECRET` | for ISR webhook | Any shared secret; matches the Sanity webhook |

For CI, set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and
`SANITY_API_TOKEN` as repository secrets (build + E2E need them; the unit suite stubs them).

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next dev server with HMR |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build locally |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit + component tests |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:cov` | Vitest with coverage report |
| `pnpm test:e2e` | Playwright E2E (boots prod build first) |
| `pnpm test:e2e:ui` | Playwright UI mode |
| `pnpm typegen` | Extract Sanity schema → regenerate `sanity.types.ts` |
| `pnpm backup` | Export the production dataset to `backups/` |

Content maintenance (one-shot, dotenv-loaded): `pnpm seed:stack-tags`,
`pnpm migrate:content[:dry]`, `pnpm publish:drafts[:dry]`.

## Project structure

```
src/
├── app/                 # Next App Router
│   ├── [locale]/        #   home, about, work/[slug], not-found
│   ├── studio/          #   embedded Sanity Studio (/studio)
│   ├── api/revalidate/  #   Sanity webhook → ISR
│   ├── og/[slug]/       #   per-case-study OG image
│   ├── robots.ts · sitemap.ts · layout.tsx
├── components/          # React components, grouped by domain
│   ├── work/            #   project log, filters, empty state, device frames
│   ├── layout/          #   top bar, footer, locale switch, info tip, outbound link
│   ├── about/           #   career timeline, availability badge
│   ├── home/            #   HomeLead
│   ├── theme/           #   ThemeToggle
│   ├── brand/           #   Wordmark
│   └── seo/             #   JsonLd
├── lib/                 # pure helpers (work filtering, display, SEO, JSON-LD, analytics)
├── sanity/              # schemas, GROQ queries, client, image helpers
├── i18n/                # locale config + UI string dictionaries (en, nl)
├── hooks/               # shared React hooks
└── proxy.ts             # i18n + redirect middleware (Next "proxy")

e2e/                     # Playwright specs
```

## Architecture & decisions

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the longer-form story: design rules,
content model, routing & i18n, accessibility decisions, SEO, and testing strategy.

## Editing content

Open the embedded Studio at `/studio`. The singletons to fill first (pinned at the
top of the Studio nav):

- **Profile** — name, role line, bio, beyond-code items (with images), portrait, per-locale CV PDFs.
- **Site settings** — contact email, ordered social links, meta description, OG image.
- **Availability** — status (`available` / `after-hours` / `unavailable`) and a message line.
- **Empty states** — optional per-filter-combo overrides for the project-log empty state.

Projects are added under **Project**. Set `engagement`
(freelance / full-time / internship / student), pick the matching employer
(timeline entry) when relevant, fill the localized summary, and add either a
case-study body (full case study) or a gallery (screenshots-only). The detail-page
depth is derived automatically: `body` → full, `gallery` → screenshots, neither →
no detail page.

## Deployment

Vercel, automatic on `main`. Content changes in Sanity trigger an on-demand
revalidate webhook (`/api/revalidate`, guarded by `SANITY_REVALIDATE_SECRET`).

## License

All rights reserved.
