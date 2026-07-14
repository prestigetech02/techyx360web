import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { JOB_OPENING_STATUSES, parseJobOpeningBody } from "@/lib/careers/parse-job-opening-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function isSalaryMigrationError(message?: string) {
  return Boolean(
    message?.includes("salary_min") || message?.includes("salary_max")
  )
}

export async function GET(_request: Request, context: RouteContext) {
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

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("job_openings")
      .select(
        "id, slug, title, department, location, employment_type, description, overview, responsibilities, requirements, nice_to_have, benefits, status, icon, sort_order, salary_min, salary_max, created_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle()

    if (error) {
      console.error("Failed to load job opening", error)
      return NextResponse.json(
        { error: "Unable to load job listing." },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 })
    }

    return NextResponse.json({ listing: data })
  } catch (error) {
    console.error("Unexpected job opening fetch error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params

  try {
    const body = (await request.json()) as Record<string, unknown>
    const supabase = createAdminClient()

    if (
      typeof body.status === "string" &&
      Object.keys(body).length === 1
    ) {
      const status = body.status.trim().toLowerCase()

      if (!JOB_OPENING_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 })
      }

      const { data, error } = await supabase
        .from("job_openings")
        .update({ status })
        .eq("id", id)
        .select("id, slug, title, status")
        .single()

      if (error) {
        console.error("Failed to update job opening status", error)
        return NextResponse.json(
          { error: "Unable to update listing status." },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, listing: data })
    }

    const parsed = parseJobOpeningBody(body)
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const { data, error } = await supabase
      .from("job_openings")
      .update(parsed.data)
      .eq("id", id)
      .select("id, slug, title, salary_min, salary_max, status")
      .single()

    if (error) {
      console.error("Failed to update job opening", error)

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A listing with this slug already exists." },
          { status: 409 }
        )
      }

      if (isSalaryMigrationError(error.message)) {
        return NextResponse.json(
          {
            error:
              "Salary columns are missing in Supabase. Run supabase/job-openings-salary-migration.sql, then try again.",
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: "Unable to update job listing right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (error) {
    console.error("Unexpected job listing update error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("job_openings").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete job opening", error)
      return NextResponse.json(
        { error: "Unable to delete listing." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected job listing delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
