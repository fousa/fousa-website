import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Project } from "@/lib/work";
import { ProjectLog } from "./ProjectLog";

// ProjectLog reads filter state from the URL via next/navigation hooks. We mock
// them so the component runs outside a Next app. `state.params` is hoisted so
// the factory can read it, and each test can swap it before rendering.
const state = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => state.params,
}));

/** A web-only project with a case study (depth "full"). */
const vulture: Project = {
  slug: "vulture",
  name: "Vulture",
  employer: null,
  client: null,
  stack: "Next.js",
  role: "Solo",
  year: 2024,
  endYear: null,
  state: "active",
  engagement: "freelance",
  tagSlugs: ["website"],
  employerSlug: null,
  summary: "Self-hosted uptime.",
  depth: "full",
  gallery: [],
  featureTooling: false,
};

beforeEach(() => {
  state.params = new URLSearchParams();
});

describe("<ProjectLog>", () => {
  it("expands a desktop row when activated by keyboard", async () => {
    const user = userEvent.setup();
    render(<ProjectLog projects={[vulture]} locale="en" overrides={[]} />);

    // Scope to the table so the parallel mobile card markup doesn't double-match.
    const table = screen.getByRole("table");
    const row = within(table).getByRole("button", { name: /Vulture/i });
    expect(row).toHaveAttribute("aria-expanded", "false");

    row.focus();
    await user.keyboard("{Enter}");

    expect(row).toHaveAttribute("aria-expanded", "true");
  });

  it("renders the empty state when active filters match no projects", () => {
    // Vulture is web-only, so an Apple filter yields zero rows.
    state.params = new URLSearchParams("stack=apple");
    render(<ProjectLog projects={[vulture]} locale="en" overrides={[]} />);

    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
    // The empty state is announced via an aria-live status region.
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });
});
