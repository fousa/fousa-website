import { describe, it, expect } from "vitest";
import { sizeSkills, groupByCategory } from "./skills";

const mk = (key: string, count: number, category: string | null = null) => ({
  key,
  name: key,
  count,
  category,
});

describe("sizeSkills", () => {
  it("most-used gets step 1, least-used the largest step", () => {
    const skills = [mk("a", 30), mk("b", 20), mk("c", 10), mk("d", 5), mk("e", 1)];
    const m = sizeSkills(skills);
    expect(m.get("a")).toBe(1);
    expect(m.get("e")).toBe(5);
  });
  it("equal counts get the same step", () => {
    const m = sizeSkills([mk("a", 10), mk("b", 10), mk("c", 2)]);
    expect(m.get("a")).toBe(m.get("b"));
  });
});

describe("groupByCategory", () => {
  it("orders groups by the fixed category order and omits empties", () => {
    const out = groupByCategory([mk("rails", 5, "framework"), mk("swift", 9, "language")]);
    expect(out.map((g) => g.category)).toEqual(["language", "framework"]);
  });
  it("sorts within a group by count desc then name", () => {
    const out = groupByCategory([mk("php", 3, "language"), mk("swift", 9, "language"), mk("ruby", 9, "language")]);
    expect(out[0].skills.map((s) => s.key)).toEqual(["ruby", "swift", "php"]);
  });
  it("buckets null/unknown category into 'other', placed last", () => {
    const out = groupByCategory([mk("swift", 9, "language"), mk("weird", 2, null), mk("x", 2, "nope")]);
    expect(out.at(-1)!.category).toBe("other");
    expect(out.at(-1)!.skills.map((s) => s.key).sort()).toEqual(["weird", "x"]);
  });
});

describe("sizeSkills stays global", () => {
  it("a high-count language outsizes a low-count service", () => {
    const steps = sizeSkills([mk("swift", 28, "language"), mk("garmin", 1, "service")]);
    expect(steps.get("swift")!).toBeLessThan(steps.get("garmin")!);
  });
});
