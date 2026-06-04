import { describe, it, expect } from "vitest";
import { sizeSkills, groupByCategory, coreKeys, type SkillCategory } from "./skills";

const cat = (key: string, order: string): SkillCategory => ({
  key,
  title: { en: key, nl: null },
  order,
});

const mk = (key: string, count: number, category: SkillCategory | null = null) => ({
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
  it("orders groups by each category's lexorank order", () => {
    const out = groupByCategory([
      mk("rails", 5, cat("framework", "0|200000:")),
      mk("swift", 9, cat("language", "0|100000:")),
    ]);
    expect(out.map((g) => g.key)).toEqual(["language", "framework"]);
  });
  it("sorts within a group by count desc then name", () => {
    const lang = cat("language", "0|100000:");
    const out = groupByCategory([mk("php", 3, lang), mk("swift", 9, lang), mk("ruby", 9, lang)]);
    expect(out[0].skills.map((s) => s.key)).toEqual(["ruby", "swift", "php"]);
  });
  it("buckets uncategorized skills into 'other', placed last", () => {
    const out = groupByCategory([mk("swift", 9, cat("language", "0|100000:")), mk("weird", 2, null), mk("x", 2, null)]);
    expect(out.at(-1)!.key).toBe("other");
    expect(out.at(-1)!.skills.map((s) => s.key).sort()).toEqual(["weird", "x"]);
  });
});

describe("coreKeys", () => {
  it("marks high-count skills as core and the long tail as not", () => {
    const core = coreKeys([mk("swift", 28), mk("ios", 26), mk("garmin", 1), mk("lua", 1)]);
    expect(core.has("swift")).toBe(true);
    expect(core.has("garmin")).toBe(false);
  });
});

describe("sizeSkills stays global", () => {
  it("a high-count language outsizes a low-count service", () => {
    const steps = sizeSkills([mk("swift", 28, cat("language", "0|100000:")), mk("garmin", 1, cat("service", "0|500000:"))]);
    expect(steps.get("swift")!).toBeLessThan(steps.get("garmin")!);
  });
});
