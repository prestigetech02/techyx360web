import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { searchAdminDashboard } from "@/lib/admin/search"

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""

  if (query.length < 2) {
    return NextResponse.json({ query, results: [] })
  }

  try {
    const results = await searchAdminDashboard(query)
    return NextResponse.json({ query, results })
  } catch (error) {
    console.error("Admin search error", error)
    return NextResponse.json(
      { error: "Unable to search the dashboard." },
      { status: 500 }
    )
  }
}
