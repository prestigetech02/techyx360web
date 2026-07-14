import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isRichTextEmpty } from "@/lib/blog/content"
import { slugify } from "@/lib/blog/posts"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { isCareerEmploymentType } from "@/config/careers"

const ALLOWED_STATUSES = new Set(["open", "closed", "draft"])
const ALLOWED_ICONS = new Set([
  "code",
  "design",
  "product",
  "support",
  "briefcase",
])

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
  }

  if (typeof value !== "string") return []

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseOptionalSalary(value: unknown) {
  if (value == null || value === "") return null
  const amount = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(amount) || amount < 0) return undefined
  return Math.round(amount)
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = (await request.json()) as Record<string, unknown>

    const title = sanitize(body.title)
    const department = sanitize(body.department)
    const location = sanitize(body.location)
    const employmentType = sanitize(body.employmentType)
    const description = sanitize(body.description)
    const overview = sanitize(body.overview)
    const status = sanitize(body.status).toLowerCase() || "open"
    const icon = sanitize(body.icon).toLowerCase() || "product"
    const slugInput = sanitize(body.slug)

    const responsibilities = parseList(body.responsibilities)
    const requirements = parseList(body.requirements)
    const niceToHave = parseList(body.niceToHave)
    const benefits = parseList(body.benefits)

    const salaryMin = parseOptionalSalary(body.salaryMin)
    const salaryMax = parseOptionalSalary(body.salaryMax)

    if (
      !title ||
      !department ||
      !location ||
      !employmentType ||
      !description ||
      isRichTextEmpty(overview)
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      )
    }

    if (!isCareerEmploymentType(employmentType)) {
      return NextResponse.json(
        { error: "Select a valid employment type." },
        { status: 400 }
      )
    }

    if (salaryMin === undefined || salaryMax === undefined) {
      return NextResponse.json(
        { error: "Enter valid salary amounts (NGN per month), or leave blank." },
        { status: 400 }
      )
    }

    if (
      salaryMin != null &&
      salaryMax != null &&
      salaryMin > salaryMax
    ) {
      return NextResponse.json(
        { error: "Salary min cannot be greater than salary max." },
        { status: 400 }
      )
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    if (!ALLOWED_ICONS.has(icon)) {
      return NextResponse.json({ error: "Invalid icon." }, { status: 400 })
    }

    const slug = slugify(slugInput || title)
    if (!slug) {
      return NextResponse.json(
        { error: "Enter a valid slug for this listing." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("job_openings")
      .insert({
        slug,
        title,
        department,
        location,
        employment_type: employmentType,
        description,
        overview,
        responsibilities,
        requirements,
        nice_to_have: niceToHave,
        benefits,
        status,
        icon,
        salary_min: salaryMin,
        salary_max: salaryMax,
      })
      .select("id, slug, title")
      .single()

    if (error) {
      console.error("Failed to create job opening", error)

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A listing with this slug already exists." },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Unable to create job listing right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (error) {
    console.error("Unexpected job listing create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
