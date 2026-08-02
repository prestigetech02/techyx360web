import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  createHostingAccount,
  getAllHostingAccounts,
} from "@/lib/crm/hosting-accounts"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { parseAmountInput } from "@/lib/money"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function asBillingCycle(value: string) {
  if (value === "Monthly" || value === "Quarterly" || value === "Annually") {
    return value
  }
  return null
}

export async function GET() {
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

  try {
    const accounts = await getAllHostingAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Failed to load hosting accounts", error)
    return NextResponse.json(
      { error: "Unable to load hosting accounts." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

  try {
    const body = (await request.json()) as Record<string, unknown>

    const clientName = sanitize(body.clientName)
    const email = sanitize(body.email)
    const phone = sanitize(body.phone)
    const domain = normalizeDomain(sanitize(body.domain))
    const provider = sanitize(body.provider)
    const plan = sanitize(body.plan)
    const billingCycle = asBillingCycle(sanitize(body.billingCycle))
    const registeredAt = sanitize(body.registeredAt)
    const expiresAt = sanitize(body.expiresAt)
    const notes = sanitize(body.notes)
    const amount = parseAmountInput(
      typeof body.amount === "number" ? String(body.amount) : sanitize(body.amount)
    )

    if (
      !clientName ||
      !email ||
      !domain ||
      !provider ||
      !plan ||
      !billingCycle ||
      !registeredAt ||
      !expiresAt
    ) {
      return NextResponse.json(
        { error: "Fill in the required hosting fields." },
        { status: 400 }
      )
    }

    if (amount === null || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid amount." },
        { status: 400 }
      )
    }

    const account = await createHostingAccount({
      clientName,
      email,
      phone,
      domain,
      provider,
      plan,
      amount,
      billingCycle,
      registeredAt,
      expiresAt,
      notes,
    })

    return NextResponse.json({ success: true, account })
  } catch (error) {
    console.error("Failed to create hosting account", error)
    return NextResponse.json(
      { error: "Unable to save hosting account right now." },
      { status: 500 }
    )
  }
}
