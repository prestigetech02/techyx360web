import { NextResponse } from "next/server"

import {
  destinationForAccountPortal,
  resolveAccountPortal,
} from "@/lib/admin/resolve-access"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    const email =
      typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const portal = await resolveAccountPortal(email)

    if (portal.kind === "staff") {
      return NextResponse.json({
        success: true,
        kind: "staff",
        destination: destinationForAccountPortal(portal),
        access: {
          kind: portal.access.kind,
          modules: portal.access.modules,
        },
      })
    }

    if (portal.kind === "pif_fellow") {
      return NextResponse.json(
        {
          error:
            "This account is a PIF fellow login. Use the PIF attendance portal instead.",
          kind: "pif_fellow",
          destination: destinationForAccountPortal(portal),
        },
        { status: 403 }
      )
    }

    // Not staff — sign them out of this admin attempt path at the client.
    return NextResponse.json(
      {
        error:
          "This account is not authorized for the staff dashboard. Add this email under Admin → Team as an active admin/staff member.",
        kind: "none",
        destination: "/admin/login",
      },
      { status: 403 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify session."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
