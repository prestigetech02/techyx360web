import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const ALLOWED_STATUSES = new Set(["new", "read", "replied"])

type RouteContext = {
  params: Promise<{ id: string }>
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
    const body = (await request.json()) as { status?: string }
    const status = typeof body.status === "string" ? body.status.trim() : ""

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("course_registrations")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single()

    if (error) {
      console.error("Failed to update course registration", error)
      return NextResponse.json(
        { error: "Unable to update registration." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, registration: data })
  } catch (error) {
    console.error("Unexpected course registration update error", error)
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
    const { error } = await supabase
      .from("course_registrations")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Failed to delete course registration", error)
      return NextResponse.json(
        { error: "Unable to delete registration." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected course registration delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
