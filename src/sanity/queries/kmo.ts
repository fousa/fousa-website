/**
 * GROQ queries for the KMO page singleton (`/nl/kmo`).
 *
 * The contact email falls back to the Site settings address; the phone stays
 * null until it is filled in. Sales-sheet PDFs are exposed as their Sanity
 * filenames: the site serves them itself under `/kmo/<file>` (see
 * `app/kmo/[file]/route.ts`) so they carry a `noindex` header.
 */
import {defineQuery} from 'next-sanity'

export const KMO_PAGE_QUERY = defineQuery(`
  *[_type == "kmoPage" && _id == "kmoPage"][0]{
    eyebrow,
    title,
    description,
    intro,
    overviewNote,
    packages[]{
      _key,
      name,
      summary,
      audience,
      features[]{ _key, name, detail, sheetOnly },
      priceFrom,
      priceTo,
      maintenanceFrom,
      mock,
      "pdfFile": sheetPdf.asset->originalFilename
    },
    steps[]{ _key, title, body },
    reasons[]{ _key, title, body, linkLabel, linkHref },
    faq[]{ _key, question, answer },
    contactTitle,
    contactBadge,
    contactBody,
    "email": coalesce(email, *[_id == "siteSettings"][0].email),
    phone,
    "allPdfFile": allSheetsPdf.asset->originalFilename
  }
`)

/** Share-card copy for the page's Open Graph image. */
export const KMO_OG_QUERY = defineQuery(`
  *[_type == "kmoPage" && _id == "kmoPage"][0]{ eyebrow, title, description }
`)

/**
 * The CDN URL of one of the page's sales sheets, looked up by filename. Only
 * files attached to the KMO page match, so the route can't serve other assets.
 */
export const KMO_PDF_QUERY = defineQuery(`
  *[_type == "kmoPage" && _id == "kmoPage"][0]{
    "url": select(
      allSheetsPdf.asset->originalFilename == $file => allSheetsPdf.asset->url,
      packages[sheetPdf.asset->originalFilename == $file][0].sheetPdf.asset->url
    )
  }
`)
