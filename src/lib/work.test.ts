import { describe, it, expect } from "vitest";
import { projectDepth, matchesFilters, hasCaseStudy, type Project, type Filters } from "./work";

/** Build a Project with sensible defaults; override only what a test cares about. */
function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "demo",
    name: "Demo",
    stack: "—",
    platforms: "—",
    role: "Lead",
    year: 2024,
    state: "active",
    engagement: "freelance",
    tagSlugs: [],
    summary: "",
    depth: "none",
    gallery: [],
    ...overrides,
  };
}

/** Build a Filters object; empty groups mean "not applied". */
function makeFilters(overrides: Partial<Filters> = {}): Filters {
  return { stack: [], status: [], tool: [], caseStudy: [], affiliation: [], skill: [], ...overrides };
}

describe("projectDepth", () => {
  it("is 'full' when the project has body content", () => {
    expect(projectDepth({ hasBody: true })).toBe("full");
  });

  it("is 'gallery' when there is no body but gallery images exist", () => {
    expect(projectDepth({ hasBody: false, galleryCount: 3 })).toBe("gallery");
  });

  it("is 'none' when there is neither body nor gallery", () => {
    expect(projectDepth({ hasBody: false, galleryCount: 0 })).toBe("none");
  });

  it("prefers 'full' over 'gallery' when both are present", () => {
    expect(projectDepth({ hasBody: true, galleryCount: 5 })).toBe("full");
  });
});

describe("matchesFilters", () => {
  it("matches every project when no filters are applied", () => {
    expect(matchesFilters(makeProject(), makeFilters())).toBe(true);
  });

  it("keeps a project whose tag is in the selected stack set", () => {
    const p = makeProject({ tagSlugs: ["Swift"] }); // normalized → 'swift' ∈ APPLE_TAGS
    expect(matchesFilters(p, makeFilters({ stack: ["apple"] }))).toBe(true);
  });

  it("drops a project whose tags miss the selected stack set", () => {
    const p = makeProject({ tagSlugs: ["website"] }); // web, not apple
    expect(matchesFilters(p, makeFilters({ stack: ["apple"] }))).toBe(false);
  });

  it("ORs within a group: apple|web keeps a web-only project", () => {
    const p = makeProject({ tagSlugs: ["website"] });
    expect(matchesFilters(p, makeFilters({ stack: ["apple", "web"] }))).toBe(true);
  });

  it("treats a project with no endYear as active", () => {
    const ongoing = makeProject({ endYear: null });
    const ended = makeProject({ endYear: 2020 });
    expect(matchesFilters(ongoing, makeFilters({ status: ["active"] }))).toBe(true);
    expect(matchesFilters(ended, makeFilters({ status: ["active"] }))).toBe(false);
  });

  it("ANDs across groups: apple-active fails when the project is apple but ended", () => {
    const p = makeProject({ tagSlugs: ["swift"], endYear: 2019 });
    const f = makeFilters({ stack: ["apple"], status: ["active"] });
    expect(matchesFilters(p, f)).toBe(false);
  });

  it("matches affiliation by engagement (freelance) and by employer slug", () => {
    const freelance = makeProject({ engagement: "freelance" });
    const employed = makeProject({ engagement: "full-time", employerSlug: "icapps" });
    expect(matchesFilters(freelance, makeFilters({ affiliation: ["freelance"] }))).toBe(true);
    expect(matchesFilters(employed, makeFilters({ affiliation: ["freelance"] }))).toBe(false);
    expect(matchesFilters(employed, makeFilters({ affiliation: ["icapps"] }))).toBe(true);
  });

  it("matches a project by an arbitrary stack key", () => {
    const p = makeProject({ tagSlugs: ["swift", "swiftui", "postgresql"] });
    expect(matchesFilters(p, makeFilters({ skill: ["postgresql"] }))).toBe(true);
    expect(matchesFilters(p, makeFilters({ skill: ["rails"] }))).toBe(false);
  });

  it("ORs within the skill group", () => {
    const p = makeProject({ tagSlugs: ["swift"] });
    expect(matchesFilters(p, makeFilters({ skill: ["rails", "swift"] }))).toBe(true);
  });

  it("ANDs a skill key with a curated axis", () => {
    const p = makeProject({ tagSlugs: ["swift"], endYear: null });
    expect(matchesFilters(p, makeFilters({ skill: ["swift"], status: ["active"] }))).toBe(true);
    const ended = makeProject({ tagSlugs: ["swift"], endYear: 2019 });
    expect(matchesFilters(ended, makeFilters({ skill: ["swift"], status: ["active"] }))).toBe(false);
  });
});

describe("hasCaseStudy", () => {
  it("is true only for full depth", () => {
    expect(hasCaseStudy(makeProject({ depth: "full" }))).toBe(true);
    expect(hasCaseStudy(makeProject({ depth: "gallery" }))).toBe(false);
    expect(hasCaseStudy(makeProject({ depth: "none" }))).toBe(false);
  });
});

describe("Case study filter", () => {
  it("matches only full-case-study projects", () => {
    const full = makeProject({ depth: "full" });
    const gallery = makeProject({ depth: "gallery" });
    expect(matchesFilters(full, makeFilters({ caseStudy: ["casestudy"] }))).toBe(true);
    expect(matchesFilters(gallery, makeFilters({ caseStudy: ["casestudy"] }))).toBe(false);
  });

  it("ANDs with another axis (Case study + active)", () => {
    const active = makeProject({ depth: "full", endYear: null });
    expect(matchesFilters(active, makeFilters({ caseStudy: ["casestudy"], status: ["active"] }))).toBe(true);
    const ended = makeProject({ depth: "full", endYear: 2019 });
    expect(matchesFilters(ended, makeFilters({ caseStudy: ["casestudy"], status: ["active"] }))).toBe(false);
  });
});

describe("Tools filter", () => {
  // The Tools axis matches via isToolProject (forLabel kind === "tool"): any
  // project with the manual isTool flag set, employer/client or not.
  it("matches a personal utility (reads as Tool)", () => {
    const tool = makeProject({ isTool: true });
    expect(matchesFilters(tool, makeFilters({ tool: ["tools"] }))).toBe(true);
  });

  it("matches a flagged tool that still has an employer/client (e.g. icapps → Tool)", () => {
    const clientP = makeProject({ client: "Telenet", isTool: true });
    expect(matchesFilters(clientP, makeFilters({ tool: ["tools"] }))).toBe(true);
  });

  it("does NOT match a personal project without the isTool flag", () => {
    const personal = makeProject({ isTool: false });
    expect(matchesFilters(personal, makeFilters({ tool: ["tools"] }))).toBe(false);
  });

  it("ANDs with another axis (Tools + active)", () => {
    const active = makeProject({ isTool: true, endYear: null });
    expect(matchesFilters(active, makeFilters({ tool: ["tools"], status: ["active"] }))).toBe(true);
    const ended = makeProject({ isTool: true, endYear: 2019 });
    expect(matchesFilters(ended, makeFilters({ tool: ["tools"], status: ["active"] }))).toBe(false);
  });
});
