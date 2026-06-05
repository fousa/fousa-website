import { describe, it, expect } from "vitest";
import {
  sortProjects,
  DEFAULT_SORT,
  isOngoing,
  effectiveEndYear,
  yearRange,
  type Project,
  type State,
} from "./work";

/** Minimal Project for sort tests — only the keys the comparator reads matter. */
function makeProject(
  name: string,
  year: number,
  state: State,
  endYear?: number | null,
): Project {
  return {
    slug: name.toLowerCase(),
    name,
    stack: "—",
    platforms: "—",
    role: "Lead",
    year,
    endYear: endYear ?? null,
    state,
    engagement: "freelance",
    tagSlugs: [],
    depth: "none",
    gallery: [],
  };
}

describe("sortProjects", () => {
  it("default: newest year first, then state rank, then name", () => {
    const list = [
      makeProject("Beta", 2022, "archived"),
      makeProject("Alpha", 2024, "active"),
      makeProject("Gamma", 2024, "archived"),
    ];
    const out = sortProjects(list, DEFAULT_SORT).map((x) => x.name);
    expect(out).toEqual(["Alpha", "Gamma", "Beta"]); // 2024 active, 2024 archived, 2022
  });

  it("sorting by project asc is alphabetical", () => {
    const list = [
      makeProject("Charlie", 2020, "active"),
      makeProject("Alpha", 2024, "archived"),
    ];
    expect(
      sortProjects(list, { key: "project", dir: "asc" }).map((x) => x.name),
    ).toEqual(["Alpha", "Charlie"]);
  });

  it("sorting by state asc puts active before archived", () => {
    const list = [
      makeProject("X", 2020, "archived"),
      makeProject("Y", 2020, "active"),
    ];
    expect(
      sortProjects(list, { key: "state", dir: "asc" }).map((x) => x.name),
    ).toEqual(["Y", "X"]);
  });

  it("ties always break deterministically on the default chain", () => {
    const list = [
      makeProject("B", 2024, "active"),
      makeProject("A", 2024, "active"),
    ];
    // same year, same state → name asc
    expect(
      sortProjects(list, { key: "year", dir: "desc" }).map((x) => x.name),
    ).toEqual(["A", "B"]);
  });

  it("does not mutate the input array", () => {
    const list = [
      makeProject("B", 2020, "active"),
      makeProject("A", 2024, "active"),
    ];
    const copy = [...list];
    sortProjects(list, { key: "project", dir: "asc" });
    expect(list).toEqual(copy);
  });

  it("an ongoing project sorts above an explicit later end year", () => {
    const list = [
      makeProject("Done", 2024, "archived", 2024),
      makeProject("Live", 2020, "active"), // ongoing → effective +Infinity
    ];
    expect(
      sortProjects(list, DEFAULT_SORT).map((x) => x.name),
    ).toEqual(["Live", "Done"]);
  });
});

describe("isOngoing", () => {
  it("is true for active/maintained with no end year", () => {
    expect(isOngoing({ state: "active", endYear: null })).toBe(true);
    expect(isOngoing({ state: "maintained", endYear: null })).toBe(true);
  });

  it("is false when an end year is set", () => {
    expect(isOngoing({ state: "active", endYear: 2024 })).toBe(false);
  });

  it("is false for archived/cancelled regardless of end year", () => {
    expect(isOngoing({ state: "archived", endYear: null })).toBe(false);
    expect(isOngoing({ state: "cancelled", endYear: null })).toBe(false);
  });
});

describe("effectiveEndYear", () => {
  it("uses the explicit end year when present", () => {
    expect(
      effectiveEndYear({ year: 2020, endYear: 2022, state: "archived" }),
    ).toBe(2022);
  });

  it("is +Infinity for ongoing projects", () => {
    expect(
      effectiveEndYear({ year: 2020, endYear: null, state: "active" }),
    ).toBe(Number.POSITIVE_INFINITY);
  });

  it("falls back to the start year otherwise", () => {
    expect(
      effectiveEndYear({ year: 2019, endYear: null, state: "archived" }),
    ).toBe(2019);
  });
});

describe("yearRange", () => {
  it("has no end for a single year", () => {
    expect(yearRange({ year: 2022, endYear: null })).toEqual({
      start: 2022,
      end: null,
    });
  });

  it("exposes start and end for a closed range", () => {
    expect(yearRange({ year: 2020, endYear: 2022 })).toEqual({
      start: 2020,
      end: 2022,
    });
  });

  it("has no end for ongoing projects (no recorded end year)", () => {
    expect(yearRange({ year: 2020, endYear: null })).toEqual({
      start: 2020,
      end: null,
    });
  });

  it("collapses a range whose end equals its start", () => {
    expect(yearRange({ year: 2021, endYear: 2021 })).toEqual({
      start: 2021,
      end: null,
    });
  });
});
