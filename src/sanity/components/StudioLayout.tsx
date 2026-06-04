'use client'
/**
 * Studio root layout wrapper.
 *
 * Wraps the entire Sanity Studio in a styled-components `StyleSheetManager` that
 * only forwards valid HTML attributes to DOM elements. This silences the noisy
 * "unknown prop … is being sent through to the DOM" warnings some Studio
 * components and plugins (e.g. @sanity/orderable-document-list passing `flex`)
 * emit. Props are still passed through untouched to React components — the
 * filter applies only when the target is a plain DOM tag.
 */
import {StyleSheetManager} from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'
import type {LayoutProps} from 'sanity'

function shouldForwardProp(propName: string, target: unknown): boolean {
  // For DOM elements the target is the tag name (a string) — drop invalid
  // attributes. For React components, forward everything as-is.
  return typeof target === 'string' ? isPropValid(propName) : true
}

export function StudioLayout(props: LayoutProps) {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      {props.renderDefault(props)}
    </StyleSheetManager>
  )
}
