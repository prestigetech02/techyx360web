import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getLeadById, insertLeadActivity } from "@/lib/crm/leads"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

const BLOCKER_LABELS: Record<string, string> = {
  deals: "deals",
  projects: "projects",
  payments: "payments",
  expenses: "expenses",
  invoices: "invoices",
}

async function getClientRevertBlockers(clientId: string) {
  const supabase = createAdminClient()

  const [deals, projects, payments, expenses, invoices] = await Promise.all([
    supabase
      .from("crm_deals")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
    supabase
      .from("crm_projects")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
    supabase
      .from("crm_payments")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
    supabase
      .from("crm_expenses")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
  ])

  const blockers: string[] = []
  if ((deals.count ?? 0) > 0) blockers.push("deals")
  if ((projects.count ?? 0) > 0) blockers.push("projects")
  if ((payments.count ?? 0) > 0) blockers.push("payments")
  if ((expenses.count ?? 0) > 0) blockers.push("expenses")
  if ((invoices.count ?? 0) > 0) blockers.push("invoices")

  return blockers
}

export async function POST(_request: Request, context: RouteContext) {
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
    const existing = await getLeadById(id)
    if (!existing) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    }

    if (existing.status !== "converted" || !existing.clientId) {
      return NextResponse.json(
        { error: "This lead has not been converted to a client." },
        { status: 400 }
      )
    }

    const clientId = existing.clientId
    const blockers = await getClientRevertBlockers(clientId)

    if (blockers.length > 0) {
      const labels = blockers.map((key) => BLOCKER_LABELS[key] ?? key)
      return NextResponse.json(
        {
          error: `Cannot revert because this client already has linked ${labels.join(", ")}. Remove those records first or delete the client manually from Clients.`,
          blockers,
        },
        { status: 409 }
      )
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { error: deleteClientError } = await supabase
      .from("crm_clients")
      .delete()
      .eq("id", clientId)

    if (deleteClientError) {
      console.error("Failed to delete CRM client during revert", deleteClientError)
      return NextResponse.json(
        { error: "Unable to remove the linked client." },
        { status: 500 }
      )
    }

    const { error: leadError } = await supabase
      .from("crm_leads")
      .update({
        status: "qualified",
        client_id: null,
        updated_at: now,
      })
      .eq("id", id)

    if (leadError) {
      console.error("Failed to restore CRM lead after revert", leadError)
      return NextResponse.json(
        {
          error:
            "The client was removed but the lead could not be restored. Contact support if this persists.",
        },
        { status: 500 }
      )
    }

    await insertLeadActivity({
      leadId: id,
      type: "status",
      title: "Conversion reverted — restored to qualified",
      authorName: "Admin",
    })

    const lead = await getLeadById(id)
    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error("Unexpected CRM lead revert error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
