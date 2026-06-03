import { describe, it, expect } from "vitest";
import { sortProjects, DEFAULT_SORT, type Project, type State } from "./work";

/** Minimal Project for sort tests — only the keys the comparator reads matter. */
function makeProject(name: string, year: number, state: State): Project {
  return {
    slug: name.toLowerCase(),
    name,
    stack: "—",
    role: "Lead",
    year,
    state,
    engagement: "freelance",
    tagSlugs: [],
    summary: "",
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
});
