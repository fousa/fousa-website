/**
 * Typed content layer for the project log and case-study pages.
 *
 * Exports the Project type (with two-axis tagging: relation + tech), filter
 * constants, filter helper, and data-fetching functions. Currently backed by
 * static sample data; swap `getProjects` / `getProject` bodies for GROQ
 * queries against the Sanity Project schema when ready.
 */

export type Status = "live" | "done" | "paused" | "cancelled";
export type Relation = "personal" | "freelance" | "employee";

export type Project = {
  slug: string;
  name: string;
  client: string;
  stack: string;
  role: string;
  year: number;
  status: Status;
  relation: Relation;
  tech: string[];
  summary: string;
};

export const FILTERS = [
  "All",
  "Personal",
  "Freelance",
  "Employee",
  "iOS",
  "Rails",
  "Other",
] as const;

export type Filter = (typeof FILTERS)[number];

/** Tech keys that have their own filter chip; everything else is "Other". */
const KNOWN_TECH = ["ios", "rails"];
const RELATIONS: string[] = ["personal", "freelance", "employee"];

/**
 * Test whether a project passes the given filter.
 *
 * @param p - project to test
 * @param f - active filter value
 * @returns true when the project should be visible
 */
export function matchesFilter(p: Project, f: Filter): boolean {
  if (f === "All") return true;
  const k = f.toLowerCase();
  if (RELATIONS.includes(k)) return p.relation === (k as Relation);
  if (k === "other") return !p.tech.some((t) => KNOWN_TECH.includes(t));
  return p.tech.includes(k);
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
    client: "BOSA",
    stack: "Swift · iOS",
    role: "Freelance iOS Lead",
    year: 2022,
    status: "done",
    relation: "freelance",
    tech: ["ios"],
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
    relation: "personal",
    tech: ["web"],
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
    relation: "personal",
    tech: ["ios"],
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
    relation: "employee",
    tech: ["web"],
    summary: "Data-dense retail-investing interfaces for KBC.",
  },
];
