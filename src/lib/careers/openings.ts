import "server-only"

import type { CareerOpenPosition } from "@/config/careers"
import { careerOpenPositions as staticCareerOpenPositions } from "@/config/careers"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type JobOpeningRow = Database["public"]["Tables"]["job_openings"]["Row"]

const ALLOWED_ICONS = new Set<CareerOpenPosition["icon"]>([
  "code",
  "design",
  "product",
  "support",
])

function mapStatus(status: string): CareerOpenPosition["status"] {
  return status === "open" ? "Open" : "Closed"
}

function mapIcon(icon: string): CareerOpenPosition["icon"] {
  if (ALLOWED_ICONS.has(icon as CareerOpenPosition["icon"])) {
    return icon as CareerOpenPosition["icon"]
  }
  return "product"
}

export function mapJobOpeningRowToPosition(
  row: JobOpeningRow
): CareerOpenPosition {
  return {
    id: row.slug,
    title: row.title,
    department: row.department,
    location: row.location,
    type: row.employment_type,
    description: row.description,
    overview: row.overview,
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    niceToHave: row.nice_to_have ?? [],
    benefits: row.benefits ?? [],
    status: mapStatus(row.status),
    icon: mapIcon(row.icon),
    postedAt: row.created_at,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
  }
}

async function getDatabaseJobOpenings(options?: {
  openOnly?: boolean
}) {
  if (!isSupabaseConfigured()) {
    return [] as JobOpeningRow[]
  }

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from("job_openings")
      .select(
        "id, slug, title, department, location, employment_type, description, overview, responsibilities, requirements, nice_to_have, benefits, status, icon, sort_order, salary_min, salary_max, created_at, updated_at"
      )
      .order("created_at", { ascending: false })

    if (options?.openOnly) {
      query = query.eq("status", "open")
    }

    const { data, error } = await query

    if (error) {
      console.error("Failed to load job openings from database", error)
      return [] as JobOpeningRow[]
    }

    return data ?? []
  } catch (error) {
    console.error("Unexpected job openings lookup error", error)
    return [] as JobOpeningRow[]
  }
}

export async function getOpenJobOpenings(): Promise<CareerOpenPosition[]> {
  const rows = await getDatabaseJobOpenings({ openOnly: true })

  if (rows.length > 0) {
    return rows.map(mapJobOpeningRowToPosition)
  }

  return staticCareerOpenPositions
    .filter((position) => position.status === "Open")
    .sort(
      (left, right) =>
        new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime()
    )
}

export async function getAllJobOpenings(): Promise<CareerOpenPosition[]> {
  const rows = await getDatabaseJobOpenings()

  if (rows.length > 0) {
    return rows.map(mapJobOpeningRowToPosition)
  }

  return [...staticCareerOpenPositions].sort(
    (left, right) =>
      new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime()
  )
}

export async function getJobOpeningBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return null

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("job_openings")
        .select(
          "id, slug, title, department, location, employment_type, description, overview, responsibilities, requirements, nice_to_have, benefits, status, icon, sort_order, salary_min, salary_max, created_at, updated_at"
        )
        .eq("slug", normalized)
        .maybeSingle()

      if (error) {
        console.error("Failed to load job opening by slug", error)
      } else if (data) {
        return mapJobOpeningRowToPosition(data)
      }
    } catch (error) {
      console.error("Unexpected job opening lookup error", error)
    }
  }

  return (
    staticCareerOpenPositions.find((position) => position.id === normalized) ??
    null
  )
}

export async function getOtherOpenJobOpenings(
  currentSlug: string,
  limit = 3
): Promise<CareerOpenPosition[]> {
  const openings = await getOpenJobOpenings()
  return openings
    .filter((position) => position.id !== currentSlug)
    .slice(0, limit)
}
