/** Unit tests for the printable KMO sales sheet: content from Sanity lands on it, escaped. */
import { describe, it, expect } from "vitest";
import { renderAllSheets, renderSheet, type SheetCommon, type SheetPackage } from "./kmo-sheet";

const pkg: SheetPackage = {
  name: "Klantenportaal",
  shortName: "Portaal",
  headline: "Je klanten zien zelf hoe ver het staat.",
  intro: "Voor aannemers & dienstverleners",
  painPoints: ["Klanten die bellen"],
  features: [
    { name: "Login", detail: "Apart per klant" },
    { name: "Status", detail: "<altijd> actueel" },
  ],
  priceFrom: 15000,
  priceTo: 25000,
  maintenanceFrom: 190,
  ownershipNote: "Je portaal blijft van jou.",
  stepNotes: ["1–2 dagen", "Testen"],
  mock: "portal",
  mockHtml: '<div class="mock"></div>',
};

const common: SheetCommon = {
  steps: ["Verkenning", "Bouw"],
  cta: "Plan een verkenning",
  signature: "Jelle Vandebeeck",
  email: "hallo@example.com",
  phone: "+32 470 12 34 56",
};

describe("renderSheet", () => {
  const html = renderSheet(pkg, 1, 3, common);

  it("fills title, header, prices and contact", () => {
    expect(html).toContain("<title>Fousa · Pakket 2: klantenportaal</title>");
    expect(html).toContain("Pakket 02/03 · Portaal");
    expect(html).toContain("€15.000 – €25.000");
    expect(html).toContain("vanaf €190 per maand");
    expect(html).toContain("Alle prijzen exclusief btw. Je portaal blijft van jou.");
    expect(html).toContain('<a href="mailto:hallo@example.com">hallo@example.com</a> · +32 470 12 34 56');
    expect(html).toContain('<div class="mock"></div>');
  });

  it("ends the headline with exactly one coral dot", () => {
    expect(html).toContain('ver het staat<span style="color: var(--accent)">.</span></h1>');
  });

  it("escapes Studio text", () => {
    expect(html).toContain("aannemers &amp; dienstverleners");
    expect(html).toContain("&lt;altijd&gt; actueel");
    expect(html).not.toContain("<altijd>");
  });

  it("omits optional parts that are empty", () => {
    const bare = renderSheet({ ...pkg, painPoints: [] }, 0, 1, { ...common, phone: null });
    expect(bare).not.toContain("Herken je dit?");
    expect(bare).toContain("hallo@example.com</a></span>");
  });
});

describe("renderAllSheets", () => {
  it("puts one .sheet per package in a single document", () => {
    const html = renderAllSheets("Software op maat", [pkg, pkg, pkg], common);
    expect(html.match(/class="sheet"/g)).toHaveLength(3);
    expect(html.match(/<html/g)).toHaveLength(1);
    expect(html).toContain("<title>Fousa · Software op maat</title>");
  });
});
