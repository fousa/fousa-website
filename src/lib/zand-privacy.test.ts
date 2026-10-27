/** Unit tests for the Zand privacy policy content: both locales say the same things. */
import { describe, it, expect } from "vitest";
import { zandPrivacy } from "./zand-privacy";

describe("zandPrivacy", () => {
  it("has the same sections, paragraphs and lists in English and Dutch", () => {
    const shape = (locale: "en" | "nl") =>
      zandPrivacy[locale].sections.map((s) => [s.paragraphs.length, s.list?.length ?? 0]);
    expect(shape("nl")).toEqual(shape("en"));
  });

  it("carries the same last-updated date in both locales", () => {
    expect(zandPrivacy.nl.updated).toBe(zandPrivacy.en.updated);
  });
});
