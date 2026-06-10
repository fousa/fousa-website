/**
 * Shared `next/og` plumbing for the opengraph-image routes: the canonical card
 * size and a helper that wraps a card element in an `ImageResponse` with the OG
 * font set loaded. Keeps every route file down to "build the card, return it".
 */
import {ImageResponse} from 'next/og'
import type {ReactElement} from 'react'
import {ogFonts} from './fonts'

/** Open Graph's standard 1.91:1 card. Re-exported as each route's `size`. */
export const ogSize = {width: 1200, height: 630}

/** Render a card element to a 1200×630 PNG with the OG fonts attached. */
export async function ogResponse(node: ReactElement) {
  return new ImageResponse(node, {...ogSize, fonts: await ogFonts()})
}
