/** Unit tests for the Winter privacy policy content: both locales say the same things. */
import { describe, it, expect } from "vitest";
import { winterPrivacy } from "./winter-privacy";

describe("winterPrivacy", () => {
  it("has the same sections, paragraphs and lists in English and Dutch", () => {
    const shape = (locale: "en" | "nl") =>
      winterPrivacy[locale].sections.map((s) => [s.paragraphs.length, s.list?.length ?? 0]);
    expect(shape("nl")).toEqual(shape("en"));
  });

  it("carries the same last-updated date in both locales", () => {
    expect(winterPrivacy.nl.updated).toBe(winterPrivacy.en.updated);
  });
});
