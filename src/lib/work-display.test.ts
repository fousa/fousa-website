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

  it("returns 'personal' with the fallback label when both are missing", () => {
    expect(forLabel({ employer: null, client: null })).toEqual({
      kind: "personal",
      text: "Personal",
    });
  });

  it("honours a custom personal label", () => {
    expect(forLabel({ employer: null, client: null }, "Persoonlijk")).toEqual({
      kind: "personal",
      text: "Persoonlijk",
    });
  });

  it("treats whitespace-only values as empty", () => {
    expect(forLabel({ employer: { name: "  " }, client: "  " })).toEqual({
      kind: "personal",
      text: "Personal",
    });
  });
});
