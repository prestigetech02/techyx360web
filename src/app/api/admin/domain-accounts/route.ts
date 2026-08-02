import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  createDomainAccount,
  getAllDomainAccounts,
} from "@/lib/crm/domain-accounts"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { parseAmountInput } from "@/lib/money"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function asBillingCycle(value: string) {
  if (
    value === "Monthly" ||
    value === "Annually" ||
    value === "Biennially"
  ) {
    return value
  }
  return null
}

function parseBoolean(value: unknown) {
  return value === true || value === "true"
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
    const accounts = await getAllDomainAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Failed to load domain accounts", error)
    return NextResponse.json(
      { error: "Unable to load domain accounts." },
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
    const registrar = sanitize(body.registrar)
    const billingCycle = asBillingCycle(sanitize(body.billingCycle))
    const registeredAt = sanitize(body.registeredAt)
    const expiresAt = sanitize(body.expiresAt)
    const notes = sanitize(body.notes)
    const sslEnabled = parseBoolean(body.sslEnabled)
    const sslProvider = sanitize(body.sslProvider)
    const sslRegisteredAt = sanitize(body.sslRegisteredAt)
    const sslExpiresAt = sanitize(body.sslExpiresAt)
    const amount = parseAmountInput(
      typeof body.amount === "number" ? String(body.amount) : sanitize(body.amount)
    )
    const sslAmount = parseAmountInput(
      typeof body.sslAmount === "number"
        ? String(body.sslAmount)
        : sanitize(body.sslAmount) || "0"
    )

    if (
      !clientName ||
      !email ||
      !domain ||
      !registrar ||
      !billingCycle ||
      !registeredAt ||
      !expiresAt
    ) {
      return NextResponse.json(
        { error: "Fill in the required domain fields." },
        { status: 400 }
      )
    }

    if (amount === null || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid domain amount." },
        { status: 400 }
      )
    }

    if (sslEnabled) {
      if (!sslProvider || !sslRegisteredAt || !sslExpiresAt) {
        return NextResponse.json(
          { error: "Fill in SSL provider and dates, or turn SSL off." },
          { status: 400 }
        )
      }

      if (sslAmount === null || sslAmount < 0) {
        return NextResponse.json(
          { error: "Enter a valid SSL amount (0 for free SSL)." },
          { status: 400 }
        )
      }
    }

    const account = await createDomainAccount({
      clientName,
      email,
      phone,
      domain,
      registrar,
      amount,
      billingCycle,
      registeredAt,
      expiresAt,
      sslEnabled,
      sslProvider,
      sslAmount: sslEnabled ? (sslAmount ?? 0) : 0,
      sslRegisteredAt,
      sslExpiresAt,
      notes,
    })

    return NextResponse.json({ success: true, account })
  } catch (error) {
    console.error("Failed to create domain account", error)
    return NextResponse.json(
      { error: "Unable to save domain account right now." },
      { status: 500 }
    )
  }
}
