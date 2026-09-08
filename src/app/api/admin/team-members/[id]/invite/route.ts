import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { StaffAuthEmailError, sendStaffInviteLink } from "@/lib/auth/staff-auth-email"
import { isTransactionalEmailConfigured } from "@/lib/email/zeptomail"
import { getTeamMemberById } from "@/lib/team/members"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin("team")
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const member = await getTeamMemberById(id)
    if (!member) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      )
    }

    if (member.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Inactive team members cannot be invited. Set their status to Active first.",
        },
        { status: 400 }
      )
    }

    const email = member.email.trim()
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "This member needs a valid email before they can log in." },
        { status: 400 }
      )
    }

    if (!isTransactionalEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            "Email is not configured. Add ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL.",
        },
        { status: 500 }
      )
    }

    try {
      await sendStaffInviteLink({
        email,
        fullName: member.fullName,
        memberId: member.id,
      })
    } catch (error) {
      if (error instanceof StaffAuthEmailError && error.alreadyRegistered) {
        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: error.message,
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `Login invite sent to ${email}.`,
    })
  } catch (error) {
    console.error("Unexpected team member invite error", error)
    return NextResponse.json(
      { error: "Unable to send login invite." },
      { status: 500 }
    )
  }
}
