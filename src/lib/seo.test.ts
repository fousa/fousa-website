import { describe, it, expect } from "vitest";
import { altMetadata } from "./seo";

describe("altMetadata", () => {
  it("uses the unprefixed canonical for English and lists all hreflang variants", () => {
    expect(altMetadata("en", "/about")).toEqual({
      alternates: {
        canonical: "https://fousa.be/about",
        languages: {
          en: "https://fousa.be/about",
          nl: "https://fousa.be/nl/about",
          "x-default": "https://fousa.be/about",
        },
      },
    });
  });

  it("uses the /nl-prefixed canonical for Dutch", () => {
    const { alternates } = altMetadata("nl", "/about");
    expect(alternates?.canonical).toBe("https://fousa.be/nl/about");
  });

  it("collapses the root path so the home canonical has no trailing slash", () => {
    const { alternates } = altMetadata("en", "/");
    expect(alternates?.canonical).toBe("https://fousa.be");
    expect(alternates?.languages).toMatchObject({ nl: "https://fousa.be/nl" });
  });

  it("preserves nested paths", () => {
    const { alternates } = altMetadata("en", "/work/vulture");
    expect(alternates?.canonical).toBe("https://fousa.be/work/vulture");
  });

  it("always points x-default at the English variant", () => {
    const { alternates } = altMetadata("nl", "/work/vulture");
    expect((alternates?.languages as Record<string, string>)["x-default"]).toBe(
      "https://fousa.be/work/vulture",
    );
  });
});
