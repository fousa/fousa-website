/**
 * Shared types for the migration script.
 *
 * Frontmatter shapes from the source markdown — kept loose because some
 * fields are optional or inconsistently present. The migration normalizes
 * them into well-typed Sanity documents.
 */

export type ProjectFrontmatter = {
  title: string
  subtitle?: string
  slug: string
  type: 'client-work' | 'personal'
  employer?: string
  client?: string
  techStack?: string[]
  liveUrl?: string
  startDate: string
  endDate?: string
  featured?: boolean
}

export type TimelineFrontmatter = {
  title: string
  company: string
  startDate: string
  endDate?: string
  type: 'birth' | 'education' | 'holiday-work' | 'internship' | 'full-time' | 'freelance'
  location?: string
  image?: string
}

export type ProfileFrontmatter = {
  name: string
  role: string
  resume?: string
  socials?: {
    linkedin?: string
    github?: string
    instagram?: string
    email?: string
  }
}

/**
 * Engagement types we keep on Employer documents. Mirrors the schema enum.
 * Timeline types that don't map here (birth, education, holiday-work) are
 * filtered out during migration.
 */
export type Engagement = 'freelance' | 'full-time' | 'owner' | 'internship'
