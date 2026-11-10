/**
 * Render the KMO sales sheets from the KMO page singleton in Sanity and
 * attach them to it: one PDF per package (`packages[].sheetPdf`) plus one
 * combined file (`allSheetsPdf`). The site serves them under `/kmo/<file>`.
 *
 * Run with:  pnpm kmo:pdf
 * Dry run:   pnpm kmo:pdf:dry   (renders into a temp folder, uploads nothing)
 *
 * Re-run after editing anything that appears on a sheet. Reads the published
 * document; patches the draft too when one exists, so publishing it later
 * keeps the new files. Runs through `sanity exec --with-user-token` (CLI
 * login, `pnpm sanity login`), like cv:upload.
 *
 * Each sheet carries its own @page rule (A4, no margins), so Chrome only
 * needs to skip its header/footer. Fonts load from Google Fonts, so run it
 * online. Override the browser with CHROME=/path/to/chrome when not on macOS.
 */
import {execFileSync} from 'node:child_process'
import {existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {ALL_SHEETS_FILENAME, isKmoMock, sheetFilename} from '../src/lib/kmo'
import {renderAllSheets, renderSheet, type SheetPackage} from '../src/lib/kmo-sheet'

const ROOT = process.cwd()
const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const dryRun = process.argv.includes('--dry-run')
const client = getCliClient({apiVersion: '2024-12-01', useCdn: false})

type SourcePackage = {
  _key: string
  name: string | null
  shortName: string | null
  summary: string | null
  audience: string | null
  features: {name: string | null; detail: string | null}[] | null
  priceFrom: number | null
  priceTo: number | null
  maintenanceFrom: number | null
  mock: string | null
  sheetHeadline: string | null
  sheetIntro: string | null
  painPoints: string[] | null
  stepNotes: string[] | null
  ownershipNote: string | null
}

type Source = {
  title: string | null
  contactTitle: string | null
  email: string | null
  phone: string | null
  signature: string | null
  steps: string[] | null
  packages: SourcePackage[] | null
  drafts: string[]
}

const QUERY = `*[_id == "kmoPage"][0]{
  title,
  contactTitle,
  "email": coalesce(email, *[_id == "siteSettings"][0].email),
  phone,
  "signature": *[_id == "profile"][0].name,
  "steps": steps[].title,
  packages[]{
    _key, name, shortName, summary, audience,
    features[]{ name, detail },
    priceFrom, priceTo, maintenanceFrom, mock,
    sheetHeadline, sheetIntro, painPoints, stepNotes, ownershipNote
  },
  "drafts": *[_id == "drafts.kmoPage"]._id
}`

/** Fail with a pointer to the Studio field instead of rendering a broken sheet. */
function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Missing ${what} on the KMO page in the Studio.`)
  }
  return value
}

function toSheetPackage(p: SourcePackage, index: number): SheetPackage {
  const where = `package ${index + 1}`
  const name = required(p.name, `${where} name`)
  const mock = required(p.mock, `${where} device mock`)
  if (!isKmoMock(mock)) throw new Error(`Unknown device mock "${mock}" on ${where}.`)
  return {
    name,
    shortName: p.shortName || name,
    headline: p.sheetHeadline || required(p.summary, `${where} summary`),
    intro: p.sheetIntro || p.audience || '',
    painPoints: p.painPoints ?? [],
    features: (p.features ?? []).map((f) => ({name: f.name ?? '', detail: f.detail ?? ''})),
    priceFrom: required(p.priceFrom, `${where} price from`),
    priceTo: required(p.priceTo, `${where} price to`),
    maintenanceFrom: required(p.maintenanceFrom, `${where} maintenance price`),
    ownershipNote: p.ownershipNote ?? '',
    stepNotes: p.stepNotes ?? [],
    mock,
    mockHtml: readFileSync(resolve(ROOT, `kmo/mocks/${mock}.html`), 'utf8'),
  }
}

function printToPdf(htmlPath: string, pdfPath: string) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    // Give the Google Fonts a moment to arrive before printing.
    '--virtual-time-budget=5000',
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ]
  // Chrome refuses to sandbox as root (CI containers).
  if (process.getuid?.() === 0) args.unshift('--no-sandbox')
  execFileSync(CHROME, args, {stdio: 'ignore'})
}

async function upload(path: string, filename: string): Promise<string> {
  const asset = await client.assets.upload('file', readFileSync(path), {
    filename,
    contentType: 'application/pdf',
  })
  return asset._id
}

const fileRef = (assetId: string) => ({_type: 'file', asset: {_type: 'reference', _ref: assetId}})

async function buildKmoPdfs() {
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome not found at: ${CHROME} (set CHROME=/path/to/chrome)`)
  }
  const src = await client.fetch<Source | null>(QUERY)
  if (!src?.packages?.length) {
    throw new Error('The KMO page has no packages yet. Seed it with `pnpm kmo:seed` or fill it in the Studio.')
  }
  const packages = src.packages.map(toSheetPackage)
  const common = {
    steps: src.steps ?? [],
    cta: required(src.contactTitle, 'call to action'),
    signature: required(src.signature, 'name (Profile)'),
    email: required(src.email?.trim(), 'contact email (KMO page or Site settings)'),
    phone: src.phone?.trim() || null,
  }

  const out = mkdtempSync(join(tmpdir(), 'kmo-pdf-'))
  const rendered: {key: string | null; file: string; path: string}[] = []
  try {
    packages.forEach((pkg, i) => {
      const file = sheetFilename(i, pkg.shortName)
      const html = join(out, `${file}.html`)
      writeFileSync(html, renderSheet(pkg, i, packages.length, common))
      printToPdf(html, join(out, file))
      rendered.push({key: src.packages![i]._key, file, path: join(out, file)})
      console.log(`Rendered ${file}`)
    })
    const allHtml = join(out, `${ALL_SHEETS_FILENAME}.html`)
    writeFileSync(allHtml, renderAllSheets(required(src.title, 'title'), packages, common))
    printToPdf(allHtml, join(out, ALL_SHEETS_FILENAME))
    rendered.push({key: null, file: ALL_SHEETS_FILENAME, path: join(out, ALL_SHEETS_FILENAME)})
    console.log(`Rendered ${ALL_SHEETS_FILENAME} (all ${packages.length} sheets)`)
    console.log(`Contact on the sheets: ${common.email}${common.phone ? ` · ${common.phone}` : ' (no phone)'}`)

    if (dryRun) {
      console.log(`\nDry run — nothing uploaded. PDFs and HTML are in ${out}`)
      return
    }

    const patch: Record<string, unknown> = {}
    for (const r of rendered) {
      const assetId = await upload(r.path, r.file)
      patch[r.key ? `packages[_key=="${r.key}"].sheetPdf` : 'allSheetsPdf'] = fileRef(assetId)
    }
    const tx = client.transaction()
    for (const id of ['kmoPage', ...src.drafts]) tx.patch(id, (p) => p.set(patch))
    await tx.commit()
    console.log(`\nUploaded ${rendered.length} PDFs and attached them to ${['kmoPage', ...src.drafts].join(', ')}.`)
    rmSync(out, {recursive: true, force: true})
  } catch (err) {
    console.error(`Work files kept in ${out}`)
    throw err
  }
}

buildKmoPdfs().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
