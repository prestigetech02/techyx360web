import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import { getProjectsByClientId } from "@/lib/crm/projects"
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
    const client = await getClientById(id)
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    const projects = await getProjectsByClientId(id)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Unexpected client projects list error", error)
    return NextResponse.json(
      { error: "Unable to load projects." },
      { status: 500 }
    )
  }
}
