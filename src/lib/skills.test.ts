import { describe, it, expect } from "vitest";
import { sizeSkills, driftOffset, displayOrder, meaningful } from "./skills";

const mk = (key: string, count: number) => ({ key, name: key, count });

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

describe("driftOffset", () => {
  it("is deterministic and within −6..+6", () => {
    const d = driftOffset("swift");
    expect(d).toBe(driftOffset("swift")); // stable
    expect(d).toBeGreaterThanOrEqual(-6);
    expect(d).toBeLessThanOrEqual(6);
  });
});

describe("displayOrder", () => {
  it("is a stable permutation (same set, deterministic order)", () => {
    const s = [mk("a", 1), mk("b", 2), mk("c", 3)];
    const o1 = displayOrder(s).map((x) => x.key);
    const o2 = displayOrder(s).map((x) => x.key);
    expect(o1).toEqual(o2);
    expect([...o1].sort()).toEqual(["a", "b", "c"]);
  });
});

describe("meaningful", () => {
  it("keeps only count ≥ 2", () => {
    expect(meaningful([mk("a", 1), mk("b", 2), mk("c", 5)]).map((x) => x.key)).toEqual([
      "b",
      "c",
    ]);
  });
});
