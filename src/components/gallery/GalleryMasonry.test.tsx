import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { DeviceGroup, GalleryItem } from "@/lib/gallery";
import { GalleryMasonry } from "./GalleryMasonry";

// The masonry reads its device filter from the URL (`?d=`) via next/navigation.
// Mock the hooks so it runs outside a Next app; `state.params` is hoisted so
// each test can swap the active filter before rendering.
const state = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/gallery",
  useSearchParams: () => state.params,
}));

// Frame renders next/image; the test is about which shots the filter shows,
// not image rendering, so stub it out.
vi.mock("@/components/work/Frame", () => ({ Frame: () => null }));

/** Minimal gallery item; only `device` drives the filter under test. */
function item(device: DeviceGroup, slug: string, name: string): GalleryItem {
  return {
    projectName: name,
    slug,
    device,
    shot: { key: `${slug}-1`, imageUrl: "x.png", width: 100, height: 100, frame: "phone", caption: null },
  };
}

const shots = [
  item("iphone", "alpha", "Alpha"),
  item("ipad", "beta", "Beta"),
  item("web", "gamma", "Gamma"),
];

beforeEach(() => {
  state.params = new URLSearchParams();
  // jsdom has no ResizeObserver; the layout effect observes the grid.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("<GalleryMasonry>", () => {
  it("shows every shot when no device filter is active", () => {
    render(<GalleryMasonry shots={shots} locale="en" />);

    expect(screen.getByRole("button", { name: /All/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Open Alpha")).toHaveAttribute("data-hidden", "false");
    expect(screen.getByLabelText("Open Beta")).toHaveAttribute("data-hidden", "false");
    expect(screen.getByLabelText("Open Gamma")).toHaveAttribute("data-hidden", "false");
  });

  it("marks the active chip and hides non-matching shots when a device is selected", () => {
    state.params = new URLSearchParams("d=iphone");
    render(<GalleryMasonry shots={shots} locale="en" />);

    expect(screen.getByRole("button", { name: /iPhone/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /All/ })).toHaveAttribute("aria-pressed", "false");

    expect(screen.getByLabelText("Open Alpha")).toHaveAttribute("data-hidden", "false");
    expect(screen.getByLabelText("Open Beta")).toHaveAttribute("data-hidden", "true");
    expect(screen.getByLabelText("Open Gamma")).toHaveAttribute("data-hidden", "true");
  });
});
