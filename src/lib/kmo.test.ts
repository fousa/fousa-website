/** Unit tests for the KMO page helpers: numbering, prices, sheet filenames, tel links. */
import { describe, it, expect } from "vitest";
import {
  ALL_SHEETS_FILENAME,
  formatEuro,
  formatPriceRange,
  isKmoMock,
  isSheetFilename,
  packageAnchor,
  packageNumber,
  sheetFilename,
  sheetHref,
  slugify,
  telHref,
} from "./kmo";

describe("package numbering", () => {
  it("numbers and anchors from 1", () => {
    expect([0, 1, 9].map(packageNumber)).toEqual(["01", "02", "10"]);
    expect(packageAnchor(0)).toBe("pakket-1");
  });
});

describe("formatEuro / formatPriceRange", () => {
  it("uses Belgian thousands dots and no space after the sign", () => {
    expect(formatEuro(95)).toBe("€95");
    expect(formatEuro(12500)).toBe("€12.500");
    expect(formatEuro(1250000)).toBe("€1.250.000");
  });

  it("joins a range with a spaced en dash, or collapses equal ends", () => {
    expect(formatPriceRange(7500, 15000)).toBe("€7.500 – €15.000");
    expect(formatPriceRange(5000, 5000)).toBe("€5.000");
  });
});

describe("sheet filenames", () => {
  it("slugifies accents, punctuation and spaces", () => {
    expect(slugify("Werkbon- en inspectie-app")).toBe("werkbon-en-inspectie-app");
    expect(slugify("Één tool, géén Excel!")).toBe("een-tool-geen-excel");
  });

  it("produces names the PDF route accepts, and nothing else", () => {
    const file = sheetFilename(1, "Klantenportaal");
    expect(file).toBe("fousa-pakket-2-klantenportaal.pdf");
    expect(isSheetFilename(file)).toBe(true);
    expect(isSheetFilename(ALL_SHEETS_FILENAME)).toBe(true);
    expect(isSheetFilename("cv-en.pdf")).toBe(false);
    expect(isSheetFilename("fousa-pakket-1-../../x.pdf")).toBe(false);
    expect(sheetHref(file)).toBe("/kmo/fousa-pakket-2-klantenportaal.pdf");
  });
});

describe("isKmoMock", () => {
  it("accepts only the known mocks", () => {
    expect(["phone", "portal", "tool"].every(isKmoMock)).toBe(true);
    expect(isKmoMock("tablet")).toBe(false);
    expect(isKmoMock(null)).toBe(false);
  });
});

describe("telHref", () => {
  it("keeps only the leading plus and the digits", () => {
    expect(telHref("+32 470 12 34 56")).toBe("tel:+32470123456");
    expect(telHref("03/123.45.67")).toBe("tel:031234567");
  });
});
