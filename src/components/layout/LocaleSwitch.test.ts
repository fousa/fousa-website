import { describe, it, expect } from "vitest";
import { pathParts, hrefFor } from "./LocaleSwitch";

describe("pathParts", () => {
  it("defaults to English with no rest for the root", () => {
    expect(pathParts("/")).toEqual({ locale: "en", rest: [] });
  });

  it("treats an unprefixed path as English", () => {
    expect(pathParts("/about")).toEqual({ locale: "en", rest: ["about"] });
  });

  it("detects the /nl prefix and strips it from the rest", () => {
    expect(pathParts("/nl")).toEqual({ locale: "nl", rest: [] });
    expect(pathParts("/nl/about")).toEqual({ locale: "nl", rest: ["about"] });
  });
});

describe("hrefFor", () => {
  it("adds the /nl prefix when switching to Dutch", () => {
    expect(hrefFor("/about", "nl")).toBe("/nl/about");
  });

  it("drops the prefix when switching back to English (the default)", () => {
    expect(hrefFor("/nl/about", "en")).toBe("/about");
  });

  it("maps the root correctly in both directions", () => {
    expect(hrefFor("/", "nl")).toBe("/nl");
    expect(hrefFor("/nl", "en")).toBe("/");
  });

  it("preserves nested segments across the switch", () => {
    expect(hrefFor("/work/vulture", "nl")).toBe("/nl/work/vulture");
  });
});
