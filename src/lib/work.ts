/**
 * Typed content layer for the project log and case-study pages.
 *
 * Exports the Project type, filter constants, filter helper, and data-fetching
 * functions. Currently backed by static sample data; swap `getProjects` /
 * `getProject` bodies for GROQ queries against the Sanity Project schema when
 * ready — the component interface stays identical.
 */

export type Status = "live" | "done" | "paused" | "cancelled";

export type Project = {
  slug: string;
  name: string;
  client: string;
  stack: string;
  role: string;
  year: number;
  status: Status;
  tags: string[];
  summary: string;
};

export const FILTERS = [
  "All",
  "Live",
  "Freelance",
  "Personal",
  "iOS",
  "Web",
] as const;

export type Filter = (typeof FILTERS)[number];

/**
 * Test whether a project passes the given filter.
 *
 * @param p - project to test
 * @param f - active filter value
 * @returns true when the project should be visible
 */
export function matchesFilter(p: Project, f: Filter): boolean {
  if (f === "All") return true;
  if (f === "Live") return p.status === "live";
  return p.tags.includes(f.toLowerCase());
}

/**
 * Fetch all projects for the log page.
 * TODO: replace with a Sanity GROQ query against the Project schema.
 *
 * @param _locale - reserved for future localized summaries
 */
export async function getProjects(_locale?: string): Promise<Project[]> {
  return SAMPLE;
}

/**
 * Fetch a single project by slug for the case-study page.
 * TODO: replace with a Sanity GROQ query.
 *
 * @param slug - project slug
 * @param _locale - reserved for future localized fields
 */
export async function getProject(
  slug: string,
  _locale?: string,
): Promise<Project | undefined> {
  return SAMPLE.find((p) => p.slug === slug);
}

/** Placeholder data — mirrors the Sanity Project schema shape. */
const SAMPLE: Project[] = [
  {
    slug: "itsme",
    name: "itsme",
    client: "Freelance",
    stack: "Swift · iOS",
    role: "Freelance iOS Lead",
    year: 2022,
    status: "done",
    tags: ["freelance", "ios"],
    summary:
      "Led iOS feature work for the national digital-identity app.",
  },
  {
    slug: "vulture",
    name: "Vulture",
    client: "Personal",
    stack: "Next.js · TS",
    role: "Owner",
    year: 2024,
    status: "live",
    tags: ["personal", "web"],
    summary:
      "Self-hosted uptime + log aggregation dashboard; one VPS, ~2M events/day.",
  },
  {
    slug: "soaring-book",
    name: "Soaring Book",
    client: "Personal",
    stack: "SwiftUI",
    role: "Owner",
    year: 2023,
    status: "live",
    tags: ["personal", "ios"],
    summary: "A logbook for glider pilots, in SwiftUI.",
  },
  {
    slug: "bolero",
    name: "Bolero",
    client: "KBC",
    stack: "Angular",
    role: "Developer",
    year: 2020,
    status: "done",
    tags: ["web"],
    summary: "Data-dense retail-investing interfaces for KBC.",
  },
];
