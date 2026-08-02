import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { deleteHostingAccount } from "@/lib/crm/hosting-accounts"
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
    await deleteHostingAccount(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete hosting account", error)
    return NextResponse.json(
      { error: "Unable to delete hosting account." },
      { status: 500 }
    )
  }
}
