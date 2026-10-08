import { NextResponse } from "next/server"

import { isPifAttendanceOpen } from "@/lib/pif/attendance"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ isOpen: false })
  }

  try {
    const isOpen = await isPifAttendanceOpen()
    return NextResponse.json({ isOpen })
  } catch {
    return NextResponse.json({ isOpen: false })
  }
}
