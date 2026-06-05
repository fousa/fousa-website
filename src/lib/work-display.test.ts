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

describe("forLabel — Tool flag", () => {
  it("is a bare Tool when personal + the isTool flag is set", () => {
    expect(forLabel({ ...base, isTool: true })).toEqual({ kind: "tool" });
  });

  it("is NOT Tool when the flag is unset, even for a personal project", () => {
    expect(forLabel({ ...base, isTool: false })).toEqual({ kind: "personal" });
    expect(forLabel({ ...base })).toEqual({ kind: "personal" });
  });

  it("prefixes the Tool with the employer (e.g. an internal icapps tool)", () => {
    expect(
      forLabel({ employer: { name: "icapps" }, client: "iCapps", isTool: true }),
    ).toEqual({ kind: "tool", via: "icapps" });
  });

  it("falls back to the client as the Tool prefix when there's no employer", () => {
    expect(
      forLabel({ employer: null, client: "Telenet", isTool: true }),
    ).toEqual({ kind: "tool", via: "Telenet" });
  });
});
