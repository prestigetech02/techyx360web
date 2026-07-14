import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getCareerCvSignedUrl } from "@/lib/careers/cv-upload"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
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
      .from("career_applications")
      .select("id, cv_path, full_name")
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      )
    }

    const signedUrl = await getCareerCvSignedUrl(data.cv_path)
    if (!signedUrl) {
      return NextResponse.json(
        { error: "Unable to generate CV download link." },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: signedUrl, name: data.full_name })
  } catch (error) {
    console.error("Unexpected career CV URL error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
