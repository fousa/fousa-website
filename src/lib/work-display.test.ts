import { describe, it, expect } from "vitest";
import { forLabel } from "./work-display";

describe("forLabel", () => {
  it("returns 'via' when both employer and client are set", () => {
    expect(forLabel({ employer: { name: "icapps" }, client: "Telenet" })).toEqual(
      { kind: "via", employer: "icapps", client: "Telenet" },
    );
  });

  it("returns 'single' with the employer name when only employer is set", () => {
    expect(forLabel({ employer: { name: "KBC" }, client: null })).toEqual({
      kind: "single",
      text: "KBC",
    });
  });

  it("returns 'single' with the client when only client is set", () => {
    expect(forLabel({ employer: null, client: "Telenet" })).toEqual({
      kind: "single",
      text: "Telenet",
    });
  });

  it("returns 'personal' when both are missing", () => {
    expect(forLabel({ employer: null, client: null })).toEqual({
      kind: "personal",
    });
  });

  it("treats whitespace-only values as empty", () => {
    expect(forLabel({ employer: { name: "  " }, client: "  " })).toEqual({
      kind: "personal",
    });
  });
});

const base = { employer: null, client: null };

describe("forLabel — Tool derivation", () => {
  it("is Tool when personal + no case study + has a link", () => {
    expect(
      forLabel({ ...base, depth: "none", links: { github: "https://gh/x" } }),
    ).toEqual({ kind: "tool" });
  });

  it("is NOT Tool when it has a case study (depth full), even with a link", () => {
    expect(
      forLabel({ ...base, depth: "full", links: { github: "https://gh/x" } }),
    ).toEqual({ kind: "personal" });
  });

  it("is NOT Tool when personal + no link (just an un-writtenup personal project)", () => {
    expect(forLabel({ ...base, depth: "none", links: {} })).toEqual({
      kind: "personal",
    });
  });

  it("keeps the client relationship even when case-study-less with a link", () => {
    expect(
      forLabel({
        employer: null,
        client: "Telenet",
        depth: "none",
        links: { live: "https://x" },
      }),
    ).toEqual({ kind: "single", text: "Telenet" });
  });

  it("keeps employer → client over Tool", () => {
    expect(
      forLabel({
        employer: { name: "icapps" },
        client: "Telenet",
        depth: "none",
        links: { github: "https://x" },
      }),
    ).toEqual({ kind: "via", employer: "icapps", client: "Telenet" });
  });
});
