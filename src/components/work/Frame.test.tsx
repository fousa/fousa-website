import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import type { Frame as FrameValue, GalleryShot } from "@/lib/work";
import { Frame } from "./Frame";

// The frame is about chrome (border + cue), not image loading; render next/image
// as a plain <img> so the test stays focused on the per-device cue.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

/** A minimal shot; only `frame` drives the cue under test. */
function shot(frame: string): GalleryShot {
  return { key: "k", imageUrl: "/x.png", width: 100, height: 200, frame: frame as FrameValue, caption: null };
}

describe("<Frame>", () => {
  it("renders the iPhone Dynamic Island", () => {
    const { container } = render(<Frame shot={shot("phone")} />);
    expect(container.querySelector(".dframe--phone")).toBeTruthy();
    expect(container.querySelector(".dframe__island")).toBeTruthy();
  });

  it("renders the Mac titlebar dots, not a URL pill", () => {
    const { container } = render(<Frame shot={shot("mac")} />);
    expect(container.querySelector(".dframe__bar-mac")).toBeTruthy();
    expect(container.querySelector(".dframe__bar-web")).toBeNull();
  });

  it("renders the Web URL pill, not Mac dots", () => {
    const { container } = render(<Frame shot={shot("browser")} />);
    expect(container.querySelector(".dframe__bar-web")).toBeTruthy();
    expect(container.querySelector(".dframe__bar-mac")).toBeNull();
  });

  it("hangs a pedestal stand under the TV", () => {
    const { container } = render(<Frame shot={shot("tv")} />);
    expect(container.querySelector(".dframe--tv")).toBeTruthy();
    expect(container.querySelector(".dframe-stand")).toBeTruthy();
  });

  it("renders the Watch squircle with no cue", () => {
    const { container } = render(<Frame shot={shot("watch")} />);
    expect(container.querySelector(".dframe--watch")).toBeTruthy();
    expect(container.querySelector(".dframe__island")).toBeNull();
  });

  it("falls back to the plain other frame for an unknown value", () => {
    const { container } = render(<Frame shot={shot("totally-unknown")} />);
    expect(container.querySelector(".dframe--other")).toBeTruthy();
  });
});
