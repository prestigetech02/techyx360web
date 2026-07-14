import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { parseJobOpeningBody } from "@/lib/careers/parse-job-opening-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

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
    const parsed = parseJobOpeningBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("job_openings")
      .insert(parsed.data)
      .select("id, slug, title, salary_min, salary_max")
      .single()

    if (error) {
      console.error("Failed to create job opening", error)

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A listing with this slug already exists." },
          { status: 409 }
        )
      }

      if (
        error.message?.includes("salary_min") ||
        error.message?.includes("salary_max")
      ) {
        return NextResponse.json(
          {
            error:
              "Salary columns are missing in Supabase. Run supabase/job-openings-salary-migration.sql, then try again.",
          },
          { status: 500 }
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
