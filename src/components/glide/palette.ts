/**
 * Reads the game's colour palette from the live site CSS custom properties.
 *
 * The canvas can't use Tailwind classes, so we resolve the same tokens the
 * rest of the UI uses (`--bg`, `--ink`, `--accent`, …) off <html> with
 * getComputedStyle. Re-reading after a `.dark` class flip is what lets the
 * canvas track light/dark in lock-step with the site — see GlideCanvas.
 */
export type Palette = {
  bg: string;
  surface: string;
  ink: string;
  text: string;
  muted: string;
  faint: string;
  line: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  panel: string;
  panelText: string;
  panelMuted: string;
  warn: string;
};

/** CSS variable name backing each palette key. */
const TOKENS: Record<keyof Palette, string> = {
  bg: "--bg",
  surface: "--surface",
  ink: "--ink",
  text: "--text",
  muted: "--muted",
  faint: "--faint",
  line: "--line",
  accent: "--accent",
  accentSoft: "--accent-soft",
  accentDeep: "--accent-deep",
  panel: "--panel",
  panelText: "--panel-text",
  panelMuted: "--panel-muted",
  warn: "--status-warn",
};

/**
 * Resolves every palette token against <html>'s computed style. Call this on
 * open and again whenever the theme changes so the canvas stays in sync.
 */
export function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const out = {} as Palette;
  for (const key in TOKENS) {
    const k = key as keyof Palette;
    out[k] = cs.getPropertyValue(TOKENS[k]).trim();
  }
  return out;
}
