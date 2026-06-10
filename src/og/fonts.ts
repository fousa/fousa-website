/**
 * Font loader for the Open Graph cards.
 *
 * Satori (the engine behind `next/og`) renders text from raw font binaries, not
 * from CSS `@font-face` — and it accepts only ttf/otf/**woff** (never woff2). It
 * also can't reliably pick a weight out of a variable font, so we load static,
 * single-weight faces.
 *
 * We don't vendor the binaries: the three families (Space Grotesk, Inter, Space
 * Mono — the same ones the site uses via next/font) are pulled from Fontsource's
 * static `.woff` files on jsDelivr at render time and cached in-module, so each
 * serverless instance fetches them at most once. Versions are pinned so the
 * bytes can't shift under us. Requires network at build/render (always available
 * on Vercel/CI); the OG routes run on the Node runtime.
 */

/** Pinned Fontsource static `.woff` faces — latin subset, one weight each. */
const FONT_URLS = {
  grotesk:
    "https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5.2.5/files/space-grotesk-latin-700-normal.woff",
  inter:
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.5/files/inter-latin-400-normal.woff",
  interMedium:
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.5/files/inter-latin-500-normal.woff",
  mono: "https://cdn.jsdelivr.net/npm/@fontsource/space-mono@5.2.5/files/space-mono-latin-400-normal.woff",
} as const;

/** The Satori font descriptor shape (a subset of `ImageResponseOptions["fonts"]`). */
type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: "normal";
};

/** In-module cache so the binaries are fetched once per serverless instance. */
let cache: Promise<OgFont[]> | undefined;

/** Fetch one face and fail loudly (rather than render a fontless card) on a miss. */
async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OG font fetch failed (${res.status}): ${url}`);
  return res.arrayBuffer();
}

/**
 * The OG font set, as Satori font descriptors. Cached after the first call.
 *
 * @returns Space Grotesk 700, Inter 400 + 500, and Space Mono 400.
 */
export function ogFonts(): Promise<OgFont[]> {
  cache ??= (async () => {
    const [grotesk, inter, interMedium, mono] = await Promise.all([
      fetchFont(FONT_URLS.grotesk),
      fetchFont(FONT_URLS.inter),
      fetchFont(FONT_URLS.interMedium),
      fetchFont(FONT_URLS.mono),
    ]);
    return [
      { name: "Space Grotesk", data: grotesk, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 400, style: "normal" },
      { name: "Inter", data: interMedium, weight: 500, style: "normal" },
      { name: "Space Mono", data: mono, weight: 400, style: "normal" },
    ];
  })();
  return cache;
}
