import "server-only"

import {
  accentForIndex,
  initialsFromName,
} from "@/lib/crm/account-display"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type CrmDomainAccountRow =
  Database["public"]["Tables"]["crm_domain_accounts"]["Row"]

export type DomainAccountView = {
  id: string
  clientName: string
  email: string
  phone: string
  domain: string
  registrar: string
  amount: number
  billingCycle: "Monthly" | "Annually" | "Biennially"
  registeredAt: string
  expiresAt: string
  sslEnabled: boolean
  sslProvider: string
  sslAmount: number
  sslRegisteredAt: string
  sslExpiresAt: string
  notes: string
  initials: string
  accent: string
}

function asBillingCycle(value: string): DomainAccountView["billingCycle"] {
  if (
    value === "Monthly" ||
    value === "Annually" ||
    value === "Biennially"
  ) {
    return value
  }
  return "Annually"
}

export function mapDomainAccountRow(
  row: CrmDomainAccountRow
): DomainAccountView {
  return {
    id: row.id,
    clientName: row.client_name,
    email: row.email,
    phone: row.phone,
    domain: row.domain,
    registrar: row.registrar,
    amount: Number(row.amount),
    billingCycle: asBillingCycle(row.billing_cycle),
    registeredAt: row.registered_at,
    expiresAt: row.expires_at,
    sslEnabled: row.ssl_enabled,
    sslProvider: row.ssl_provider,
    sslAmount: Number(row.ssl_amount),
    sslRegisteredAt: row.ssl_registered_at ?? "",
    sslExpiresAt: row.ssl_expires_at ?? "",
    notes: row.notes,
    initials: initialsFromName(row.client_name),
    accent: row.accent,
  }
}

export async function getAllDomainAccounts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_domain_accounts")
    .select("*")
    .order("expires_at", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapDomainAccountRow)
}

export type CreateDomainAccountInput = {
  clientName: string
  email: string
  phone: string
  domain: string
  registrar: string
  amount: number
  billingCycle: DomainAccountView["billingCycle"]
  registeredAt: string
  expiresAt: string
  sslEnabled: boolean
  sslProvider: string
  sslAmount: number
  sslRegisteredAt: string
  sslExpiresAt: string
  notes: string
  accent?: string
}

export async function createDomainAccount(input: CreateDomainAccountInput) {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from("crm_domain_accounts")
    .select("id", { count: "exact", head: true })

  const accent = input.accent ?? accentForIndex(count ?? 0)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("crm_domain_accounts")
    .insert({
      client_name: input.clientName,
      email: input.email,
      phone: input.phone || "—",
      domain: input.domain,
      registrar: input.registrar,
      amount: input.amount,
      billing_cycle: input.billingCycle,
      registered_at: input.registeredAt,
      expires_at: input.expiresAt,
      ssl_enabled: input.sslEnabled,
      ssl_provider: input.sslEnabled ? input.sslProvider : "",
      ssl_amount: input.sslEnabled ? input.sslAmount : 0,
      ssl_registered_at: input.sslEnabled ? input.sslRegisteredAt : null,
      ssl_expires_at: input.sslEnabled ? input.sslExpiresAt : null,
      notes: input.notes,
      accent,
      updated_at: now,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to create domain account")
  }

  return mapDomainAccountRow(data)
}

export async function deleteDomainAccount(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("crm_domain_accounts")
    .delete()
    .eq("id", id)

  if (error) {
    throw error
  }
}
