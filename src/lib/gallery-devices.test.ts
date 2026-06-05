import { describe, it, expect } from "vitest";
import { deviceForFrame, DEVICE_ORDER, DEVICE_LABEL_KEY } from "./gallery-devices";

describe("deviceForFrame", () => {
  it("maps each frame onto its device group", () => {
    expect(deviceForFrame("tablet-landscape")).toBe("ipad");
    expect(deviceForFrame("tablet-portrait")).toBe("ipad");
    expect(deviceForFrame("phone")).toBe("iphone");
    expect(deviceForFrame("watch")).toBe("watch");
    expect(deviceForFrame("browser")).toBe("browser");
    expect(deviceForFrame("none")).toBe("other");
  });
});

describe("DEVICE_ORDER", () => {
  it("places iPad before iPhone before Apple Watch", () => {
    expect(DEVICE_ORDER.indexOf("ipad")).toBeLessThan(DEVICE_ORDER.indexOf("iphone"));
    expect(DEVICE_ORDER.indexOf("iphone")).toBeLessThan(DEVICE_ORDER.indexOf("watch"));
  });

  it("has a label key for every device", () => {
    for (const device of DEVICE_ORDER) {
      expect(DEVICE_LABEL_KEY[device]).toBeTruthy();
    }
  });
});
