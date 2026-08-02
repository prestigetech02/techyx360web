import "server-only"

import {
  accentForIndex,
  initialsFromName,
} from "@/lib/crm/account-display"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type CrmHostingAccountRow =
  Database["public"]["Tables"]["crm_hosting_accounts"]["Row"]

export type HostingAccountView = {
  id: string
  clientName: string
  email: string
  phone: string
  domain: string
  provider: string
  plan: string
  amount: number
  billingCycle: "Monthly" | "Quarterly" | "Annually"
  registeredAt: string
  expiresAt: string
  notes: string
  initials: string
  accent: string
}

function asBillingCycle(value: string): HostingAccountView["billingCycle"] {
  if (value === "Monthly" || value === "Quarterly" || value === "Annually") {
    return value
  }
  return "Annually"
}

export function mapHostingAccountRow(
  row: CrmHostingAccountRow
): HostingAccountView {
  return {
    id: row.id,
    clientName: row.client_name,
    email: row.email,
    phone: row.phone,
    domain: row.domain,
    provider: row.provider,
    plan: row.plan,
    amount: Number(row.amount),
    billingCycle: asBillingCycle(row.billing_cycle),
    registeredAt: row.registered_at,
    expiresAt: row.expires_at,
    notes: row.notes,
    initials: initialsFromName(row.client_name),
    accent: row.accent,
  }
}

export async function getAllHostingAccounts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_hosting_accounts")
    .select("*")
    .order("expires_at", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapHostingAccountRow)
}

export type CreateHostingAccountInput = {
  clientName: string
  email: string
  phone: string
  domain: string
  provider: string
  plan: string
  amount: number
  billingCycle: HostingAccountView["billingCycle"]
  registeredAt: string
  expiresAt: string
  notes: string
  accent?: string
}

export async function createHostingAccount(input: CreateHostingAccountInput) {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from("crm_hosting_accounts")
    .select("id", { count: "exact", head: true })

  const accent = input.accent ?? accentForIndex(count ?? 0)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("crm_hosting_accounts")
    .insert({
      client_name: input.clientName,
      email: input.email,
      phone: input.phone || "—",
      domain: input.domain,
      provider: input.provider,
      plan: input.plan,
      amount: input.amount,
      billing_cycle: input.billingCycle,
      registered_at: input.registeredAt,
      expires_at: input.expiresAt,
      notes: input.notes,
      accent,
      updated_at: now,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to create hosting account")
  }

  return mapHostingAccountRow(data)
}

export async function deleteHostingAccount(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("crm_hosting_accounts")
    .delete()
    .eq("id", id)

  if (error) {
    throw error
  }
}
