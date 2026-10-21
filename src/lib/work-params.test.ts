/** Unit tests for the log's URL helpers (`filtersFromParams`, `filtersToParams`, `parseSort`). */
import { describe, it, expect } from "vitest";
import { DEFAULT_SORT } from "./work";
import {
  filtersFromParams,
  filtersToParams,
  filterCount,
  parseSort,
  parseSkills,
  matchOverride,
} from "./work-params";

describe("filtersFromParams", () => {
  it("reads every group and drops unknown values", () => {
    const f = filtersFromParams(
      new URLSearchParams("stack=apple,bogus&status=active&affiliation=icapps&skill=swift, ruby,swift"),
    );
    expect(f.stack).toEqual(["apple"]);
    expect(f.status).toEqual(["active"]);
    expect(f.affiliation).toEqual(["icapps"]);
    expect(f.skill).toEqual(["swift", "ruby"]);
    expect(f.tool).toEqual([]);
    expect(filterCount(f)).toBe(5);
  });
});

describe("filtersToParams", () => {
  it("writes non-empty groups and removes empty ones, keeping other params", () => {
    const base = new URLSearchParams("q=hi&stack=web&status=active");
    const sp = filtersToParams(
      { stack: ["apple", "web"], status: [], tool: [], caseStudy: [], affiliation: [], skill: [] },
      base,
    );
    expect(sp.get("stack")).toBe("apple,web");
    expect(sp.has("status")).toBe(false);
    expect(sp.get("q")).toBe("hi");
    expect(base.get("status")).toBe("active");
  });
});

describe("parseSort", () => {
  it("falls back to the default for missing or invalid values", () => {
    expect(parseSort(null)).toEqual(DEFAULT_SORT);
    expect(parseSort("year-sideways")).toEqual(DEFAULT_SORT);
    expect(parseSort("colour-asc")).toEqual(DEFAULT_SORT);
    expect(parseSort("project-asc")).toEqual({ key: "project", dir: "asc" });
  });
});

describe("parseSkills / matchOverride", () => {
  it("de-duplicates skills and matches overrides order-independently", () => {
    expect(parseSkills(" a,b,,a ")).toEqual(["a", "b"]);
    const list = [{ filters: ["web", "active"], title: { en: "x" } }] as never[];
    expect(matchOverride(["active", "web"], list)).toBe(list[0]);
    expect(matchOverride(["web"], list)).toBeNull();
    expect(matchOverride([], list)).toBeNull();
  });
});
