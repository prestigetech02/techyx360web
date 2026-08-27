import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  isStudentStatus,
} from "@/lib/academy/student-types"
import { deleteStudent, updateStudent } from "@/lib/academy/students"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const body = (await request.json()) as Record<string, unknown>
    const statusValue = sanitize(body.status)
    const notes =
      body.notes === undefined ? undefined : sanitize(body.notes)
    const enrolledAt = sanitize(body.enrolledAt)

    if (statusValue && !isStudentStatus(statusValue)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const student = await updateStudent(id, {
      status: statusValue ? statusValue : undefined,
      notes,
      enrolledAt: enrolledAt || undefined,
    })

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Failed to update student", error)
    return NextResponse.json(
      { error: "Unable to update student." },
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
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    await deleteStudent(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete student", error)
    return NextResponse.json(
      { error: "Unable to delete student." },
      { status: 500 }
    )
  }
}
