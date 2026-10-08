import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  sendPifFellowInviteLink,
  StaffAuthEmailError,
} from "@/lib/auth/staff-auth-email"
import { isTransactionalEmailConfigured } from "@/lib/email/zeptomail"
import { getPifFellowById, updatePifFellow } from "@/lib/pif/fellows"
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

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const fellow = await getPifFellowById(id)
    if (!fellow) {
      return NextResponse.json({ error: "Fellow not found." }, { status: 404 })
    }

    if (fellow.status === "inactive") {
      return NextResponse.json(
        {
          error:
            "Inactive fellows cannot be invited. Set their status to Invited or Active first.",
        },
        { status: 400 }
      )
    }

    if (!fellow.email.includes("@")) {
      return NextResponse.json(
        { error: "This fellow needs a valid email before they can log in." },
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
      await sendPifFellowInviteLink({
        email: fellow.email,
        fullName: fellow.fullName,
        fellowId: fellow.id,
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

    await updatePifFellow(fellow.id, {
      invitedAt: new Date().toISOString(),
      status: fellow.status === "active" ? "active" : "invited",
    })

    return NextResponse.json({
      success: true,
      message: `Login invite sent to ${fellow.email}.`,
    })
  } catch (error) {
    console.error("Unexpected PIF fellow invite error", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send fellow invite.",
      },
      { status: 500 }
    )
  }
}
