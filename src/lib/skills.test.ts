import { describe, it, expect } from "vitest";
import { sizeSkills } from "./skills";

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
