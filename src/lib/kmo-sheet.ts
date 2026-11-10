/**
 * Printable A4 sales sheet for one KMO package, as HTML for headless Chrome
 * (`pnpm kmo:pdf`). Built from the KMO page singleton in Sanity, so the
 * sheets always match the page.
 *
 * Markup and inline styles are kept as exported from the "Fousa pakketten"
 * design canvas (fousa.be minimal-modern tokens, light theme; the dark price
 * block is the single filled surface). The device mocks are static HTML in
 * `kmo/mocks/<mock>.html`, passed in by the caller so this stays pure.
 */
import {
  KMO_URL,
  formatEuro,
  formatPriceRange,
  packageNumber,
  type KmoMock,
} from "./kmo";

export type SheetFeature = { name: string; detail: string };

export type SheetPackage = {
  name: string;
  shortName: string;
  headline: string;
  intro: string;
  painPoints: string[];
  features: SheetFeature[];
  priceFrom: number;
  priceTo: number;
  maintenanceFrom: number;
  ownershipNote: string;
  /** One short line per step, aligned with `SheetCommon.steps`. */
  stepNotes: string[];
  mock: KmoMock;
  /** Device-mock markup from `kmo/mocks/<mock>.html`. Trusted, inserted as is. */
  mockHtml: string;
};

export type SheetCommon = {
  /** Step titles, in order. */
  steps: string[];
  /** CTA in the price block, "Plan een verkenning". */
  cta: string;
  /** Who signs the sheet, "Jelle Vandebeeck". */
  signature: string;
  email: string;
  phone: string | null;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const e = escapeHtml;

const SANS = "'Inter', ui-sans-serif, system-ui, sans-serif";
const DISPLAY = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO = "'Space Mono', ui-monospace, monospace";
const EYEBROW = `margin: 0 0 4px; font-family: ${MONO}; font-size: 12px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #71717A`;
const LABEL = `font-family: ${MONO}; font-size: 12px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #8A8A92`;

/** First letter lowercased, for "Pakket 1: werkbon- en inspectie-app". */
function lowerFirst(value: string): string {
  return value.charAt(0).toLocaleLowerCase("nl") + value.slice(1);
}

function head(title: string): string {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap">
<style>
  :root { --accent: #e13100; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; background: #f4f4f5; }
  a { color: inherit; text-decoration: none; }

  /* The sheet: exactly A4 at 96 dpi, centred on screen, bare on paper. */
  .sheet { margin: 32px auto; }

  @page { size: A4 portrait; margin: 0; }
  @media print {
    body { background: #fff; }
    .sheet { margin: 0; width: 210mm !important; height: 297mm !important; break-after: page; }
    .sheet:last-of-type { break-after: auto; }
  }
</style>
</head>
<body>`;
}

const FOOT = `</body>
</html>
`;

/** The `.sheet` element for one package (no document wrapper). */
export function renderSheetBody(
  pkg: SheetPackage,
  index: number,
  total: number,
  common: SheetCommon,
): string {
  const painPoints = pkg.painPoints.length
    ? `
      <div style="border-top: 1px solid #E4E4E7; padding-top: 12px; display: flex; flex-direction: column; gap: 6px">
        <h2 style="${EYEBROW}">Herken je dit?</h2>
${pkg.painPoints
  .map(
    (p) =>
      `        <div style="display: flex; gap: 10px; font-size: 16px; line-height: 1.5; color: #3F3F46"><span style="color: #71717A">—</span><span>${e(p)}</span></div>`,
  )
  .join("\n")}
      </div>`
    : "";

  // The phone mock is narrower than the browser ones, leaving room for wider labels.
  const labelWidth = pkg.mock === "phone" ? 128 : 112;
  const features = pkg.features
    .map(
      (f, i) =>
        `        <div style="display: grid; grid-template-columns: ${labelWidth}px minmax(0, 1fr); gap: 14px; align-items: baseline; padding: 7px 0${i ? "; border-top: 1px solid #E4E4E7" : ""}"><span style="font-family: ${DISPLAY}; font-size: 16px; font-weight: 600">${e(f.name)}</span><span style="font-size: 15px; line-height: 1.45; color: #3F3F46">${e(f.detail)}</span></div>`,
    )
    .join("\n");

  const steps = common.steps
    .map((title, i) => {
      const dot = i === 0 ? `<span style="width: 7px; height: 7px; border-radius: 50%; background: var(--accent)"></span>` : "";
      const number = i === 0
        ? `<span style="display: inline-flex; align-items: center; gap: 7px; font-family: ${MONO}; font-size: 12px; color: #71717A">${dot}${packageNumber(i)}</span>`
        : `<span style="font-family: ${MONO}; font-size: 12px; color: #71717A">${packageNumber(i)}</span>`;
      const note = pkg.stepNotes[i]?.trim();
      return `    <div style="border-top: 1px solid #E4E4E7; padding-top: 10px; display: flex; flex-direction: column; gap: 4px">
      ${number}
      <span style="font-family: ${DISPLAY}; font-size: 16px; font-weight: 600">${e(title)}</span>${
        note
          ? `
      <span style="font-size: 13px; line-height: 1.4; color: #3F3F46">${e(note)}</span>`
          : ""
      }
    </div>`;
    })
    .join("\n");

  const ownership = ["Alle prijzen exclusief btw.", pkg.ownershipNote.trim()].filter(Boolean).join(" ");
  const phone = common.phone ? ` · ${e(common.phone)}` : "";

  return `<div class="sheet" style="width: 794px; height: 1123px; box-sizing: border-box; padding: 48px 72px 44px; background: #FFFFFF; color: #0C0C0D; font-family: ${SANS}; -webkit-font-smoothing: antialiased; display: flex; flex-direction: column; overflow: hidden">

  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #E4E4E7">
    <a href="${KMO_URL}" style="font-family: ${DISPLAY}; font-size: 22px; font-weight: 700; letter-spacing: -0.02em">fousa<span style="color: var(--accent)">.</span>be</a>
    <span style="font-family: ${MONO}; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #71717A">Pakket ${packageNumber(index)}/${packageNumber(total - 1)} · ${e(pkg.shortName)}</span>
  </div>

  <h1 style="margin: 28px 0 0; font-family: ${DISPLAY}; font-size: 42px; line-height: 1.04; font-weight: 700; letter-spacing: -0.035em; text-wrap: balance">${e(pkg.headline.replace(/[.!?]$/, ""))}<span style="color: var(--accent)">.</span></h1>
  <p style="margin: 14px 0 0; max-width: 560px; font-size: 16px; line-height: 1.6; color: #3F3F46; text-wrap: pretty">${e(pkg.intro)}</p>

  <div style="margin-top: 28px; display: flex; gap: 32px; align-items: flex-start">
    <div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 20px">${painPoints}
      <div style="border-top: 1px solid #E4E4E7; padding-top: 12px; display: flex; flex-direction: column">
        <h2 style="${EYEBROW}">Wat je krijgt</h2>
${features}
      </div>
    </div>

${pkg.mockHtml.trimEnd()}
  </div>

  <div style="margin-top: auto; padding-top: 28px; display: grid; grid-template-columns: repeat(${Math.max(common.steps.length, 1)}, minmax(0, 1fr)); gap: 16px">
${steps}
  </div>

  <div style="margin-top: 24px; background: #0C0C0D; color: #FFFFFF; border-radius: 4px; padding: 22px 24px">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 24px">
      <div style="display: flex; flex-direction: column; gap: 4px">
        <span style="${LABEL}">Bouw</span>
        <span style="font-family: ${DISPLAY}; font-size: 32px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; white-space: nowrap">${formatPriceRange(pkg.priceFrom, pkg.priceTo)}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; text-align: right">
        <span style="${LABEL}">Onderhoud en hosting</span>
        <span style="font-family: ${DISPLAY}; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; white-space: nowrap">vanaf ${formatEuro(pkg.maintenanceFrom)} per maand</span>
      </div>
    </div>
    <p style="margin: 10px 0 0; font-size: 13px; line-height: 1.5; color: #C2C2C8">${e(ownership)}</p>
    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #2A2A2E; display: flex; justify-content: space-between; align-items: baseline; gap: 16px">
      <a href="${KMO_URL}#verkenning" style="font-family: ${DISPLAY}; font-size: 16px; font-weight: 600">${e(common.cta)}<span style="color: var(--accent)"> →</span></a>
      <span style="font-size: 13px; color: #C2C2C8">${e(common.signature)} · <a href="mailto:${e(common.email)}">${e(common.email)}</a>${phone}</span>
    </div>
  </div>
</div>`;
}

/** A complete HTML document for one package's sheet. */
export function renderSheet(
  pkg: SheetPackage,
  index: number,
  total: number,
  common: SheetCommon,
): string {
  const title = `Fousa · Pakket ${index + 1}: ${lowerFirst(pkg.name)}`;
  return `${head(title)}\n${renderSheetBody(pkg, index, total, common)}\n${FOOT}`;
}

/** One document with every sheet; each `.sheet` breaks to a new page. */
export function renderAllSheets(
  title: string,
  packages: SheetPackage[],
  common: SheetCommon,
): string {
  const bodies = packages.map((pkg, i) => renderSheetBody(pkg, i, packages.length, common));
  return `${head(`Fousa · ${title}`)}\n${bodies.join("\n")}\n${FOOT}`;
}
