import { describe, it, expect } from "vitest";
import { deviceOf, GALLERY_FILTERS } from "./gallery";

describe("deviceOf", () => {
  it("maps frames to device groups", () => {
    expect(deviceOf("phone")).toBe("iphone");
    expect(deviceOf("tablet-landscape")).toBe("ipad");
    expect(deviceOf("tablet-portrait")).toBe("ipad");
    expect(deviceOf("tv")).toBe("tv");
    expect(deviceOf("browser")).toBe("web");
  });

  it("buckets anything else (watch, none, unknown) under web", () => {
    expect(deviceOf("watch")).toBe("web");
    expect(deviceOf("none")).toBe("web");
    expect(deviceOf("")).toBe("web");
  });
});

describe("GALLERY_FILTERS", () => {
  it("leads with `all`, then one chip per device group", () => {
    expect(GALLERY_FILTERS[0]).toBe("all");
    expect(GALLERY_FILTERS).toEqual(["all", "iphone", "ipad", "tv", "web"]);
  });
});
