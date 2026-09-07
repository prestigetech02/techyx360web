import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { siteUrl } from "@/config/site"
import { getTeamMemberById } from "@/lib/team/members"
import { createAdminClient } from "@/lib/supabase/admin"
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

    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/admin/accept-invite`,
      data: {
        full_name: member.fullName,
        team_member_id: member.id,
      },
    })

    if (error) {
      const alreadyRegistered = /already been registered|already registered/i.test(
        error.message
      )
      if (alreadyRegistered) {
        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: `${email} already has a login. They can sign in at /admin/login.`,
        })
      }

      console.error("Failed to invite team member", error)
      return NextResponse.json(
        { error: error.message || "Unable to send login invite." },
        { status: 500 }
      )
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
