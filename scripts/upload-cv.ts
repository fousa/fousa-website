/**
 * Upload the rendered CV (public/cv-en.pdf) to Sanity and point the
 * profile's `cvEn` file field at it, so the live "Download CV" link serves
 * the latest render. The previous asset stays in Sanity's asset store.
 *
 * Both the published profile and its draft (if one exists) are patched, so a
 * later publish from the Studio does not revert the link.
 *
 * Run with:  pnpm cv:upload
 * Dry run:   pnpm cv:upload:dry
 *
 * Runs through `sanity exec --with-user-token`, so it uses the CLI login
 * (`pnpm sanity login`) instead of SANITY_API_TOKEN.
 */
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-12-01', useCdn: false})
const dryRun = process.argv.includes('--dry-run')
const pdfPath = resolve(process.cwd(), 'public/cv-en.pdf')

type ProfileRow = {_id: string; current: string | null}

async function uploadCv() {
  const profiles = await client.fetch<ProfileRow[]>(
    `*[_type == "profile"]{ _id, "current": cvEn.asset->originalFilename }`,
  )
  if (profiles.length === 0) {
    console.error('No profile document found — nothing to patch.')
    process.exit(1)
  }

  console.log(`Profile documents${dryRun ? ' (dry run)' : ''}:`)
  for (const p of profiles) {
    console.log(`  ${p._id.padEnd(24)} cvEn: ${p.current ?? '—'}`)
  }

  if (dryRun) {
    console.log(`\nDry run — would upload ${pdfPath} and set cvEn on the above.`)
    return
  }

  const asset = await client.assets.upload('file', readFileSync(pdfPath), {
    filename: 'cv-en.pdf',
    contentType: 'application/pdf',
  })
  console.log(`\nUploaded ${asset._id} (${asset.size} bytes)`)

  const tx = client.transaction()
  for (const p of profiles) {
    tx.patch(p._id, (patch) =>
      patch.set({cvEn: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}}),
    )
  }
  await tx.commit()
  console.log(`Patched cvEn on ${profiles.length} document(s).`)
}

uploadCv().catch((err) => {
  console.error(err)
  process.exit(1)
})
