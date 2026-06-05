/**
 * Maps a gallery shot's device `frame` onto a device group used to lay the
 * gallery out grouped-by-device (iPad → iPhone → Apple Watch → …).
 *
 * The project already stores an explicit per-shot `frame` (phone/tablet-landscape/
 * tablet-portrait/watch/browser/none), so that — not an aspect-ratio guess — is
 * the source of truth for which device a screenshot belongs to. Both tablet
 * orientations belong to the same iPad group.
 */
import type {Frame} from './work'
import type {MessageKey} from '@/i18n/messages'

export type DeviceKind = 'ipad' | 'iphone' | 'watch' | 'browser' | 'other'

/** Display order of the device groups. */
export const DEVICE_ORDER: DeviceKind[] = ['ipad', 'iphone', 'watch', 'browser', 'other']

/** i18n key for each group's heading (brand names are identical across locales). */
export const DEVICE_LABEL_KEY: Record<DeviceKind, MessageKey> = {
  ipad: 'galleryDeviceIpad',
  iphone: 'galleryDeviceIphone',
  watch: 'galleryDeviceWatch',
  browser: 'galleryDeviceBrowser',
  other: 'galleryDeviceOther',
}

export function deviceForFrame(frame: Frame): DeviceKind {
  switch (frame) {
    case 'tablet-landscape':
    case 'tablet-portrait':
      return 'ipad'
    case 'phone':
      return 'iphone'
    case 'watch':
      return 'watch'
    case 'browser':
      return 'browser'
    default:
      return 'other'
  }
}
