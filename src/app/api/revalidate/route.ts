import {revalidatePath} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      {ok: false, error: 'Invalid secret'},
      {status: 401}
    )
  }

  try {
    const body = await req.json()
    const type = body?._type as string | undefined
    const slug = body?.slug?.current as string | undefined

    if (type === 'project' && slug) {
      revalidatePath(`/en/${slug}`)
      revalidatePath(`/nl/${slug}`)
    }

    revalidatePath('/en')
    revalidatePath('/nl')
    revalidatePath('/en/about')
    revalidatePath('/nl/about')

    return NextResponse.json({ok: true, revalidated: true, type, slug})
  } catch (err) {
    return NextResponse.json({ok: false, error: String(err)}, {status: 500})
  }
}
