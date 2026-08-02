import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { deleteDomainAccount } from "@/lib/crm/domain-accounts"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
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
    await deleteDomainAccount(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete domain account", error)
    return NextResponse.json(
      { error: "Unable to delete domain account." },
      { status: 500 }
    )
  }
}
