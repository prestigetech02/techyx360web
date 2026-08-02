import "server-only"

import { touchClientActivity } from "@/lib/crm/clients"
import {
  DEAL_STAGE_LABELS,
  formatDealDate,
  isDealStage,
  type DealStage,
  type DealView,
} from "@/lib/crm/deal-types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type CrmDealRow = Database["public"]["Tables"]["crm_deals"]["Row"]

function mapDealRow(row: CrmDealRow, clientName: string): DealView {
  const stage = isDealStage(row.stage) ? row.stage : "qualified"

  return {
    id: row.id,
    clientId: row.client_id,
    clientName,
    title: row.title,
    value: Number(row.value),
    currency: row.currency,
    stage,
    stageLabel: DEAL_STAGE_LABELS[stage],
    probability: row.probability,
    expectedCloseDate: row.expected_close_date,
    expectedCloseDateLabel: formatDealDate(row.expected_close_date),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadClientNames(clientIds: string[]) {
  const supabase = createAdminClient()
  const uniqueIds = [...new Set(clientIds.filter(Boolean))]
  const names = new Map<string, string>()

  if (uniqueIds.length === 0) return names

  const { data, error } = await supabase
    .from("crm_clients")
    .select("id, company")
    .in("id", uniqueIds)

  if (error) {
    console.error("Failed to load deal client names", error)
    return names
  }

  for (const client of data ?? []) {
    names.set(client.id, client.company)
  }

  return names
}

export async function getAllDeals() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_deals")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) throw error

  const rows = data ?? []
  const names = await loadClientNames(rows.map((row) => row.client_id))

  return rows.map((row) =>
    mapDealRow(row, names.get(row.client_id) ?? "Unknown client")
  )
}

export async function getDealsByClientId(clientId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_deals")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false })

  if (error) throw error

  const rows = data ?? []
  const names = await loadClientNames([clientId])

  return rows.map((row) =>
    mapDealRow(row, names.get(row.client_id) ?? "Unknown client")
  )
}

export async function getDealStats() {
  const deals = await getAllDeals()
  const openDeals = deals.filter((deal) => deal.stage !== "lost")
  const wonValue = deals
    .filter((deal) => deal.stage === "won")
    .reduce((sum, deal) => sum + deal.value, 0)

  return {
    totalDeals: openDeals.length,
    wonValue,
  }
}

export type CreateDealInput = {
  clientId: string
  title: string
  value: number
  stage: DealStage
  probability?: number | null
  expectedCloseDate?: string | null
  notes?: string
}

export async function createDeal(input: CreateDealInput) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("crm_deals")
    .insert({
      client_id: input.clientId,
      title: input.title,
      value: input.value,
      stage: input.stage,
      probability: input.probability ?? null,
      expected_close_date: input.expectedCloseDate || null,
      notes: input.notes ?? "",
      updated_at: now,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to create deal")
  }

  await touchClientActivity(input.clientId)
  const names = await loadClientNames([input.clientId])
  return mapDealRow(data, names.get(input.clientId) ?? "Unknown client")
}

export type UpdateDealInput = Partial<{
  title: string
  value: number
  stage: DealStage
  probability: number | null
  expectedCloseDate: string | null
  notes: string
}>

export async function updateDeal(id: string, input: UpdateDealInput) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const patch: Database["public"]["Tables"]["crm_deals"]["Update"] = {
    updated_at: now,
  }

  if (input.title !== undefined) patch.title = input.title
  if (input.value !== undefined) patch.value = input.value
  if (input.stage !== undefined) patch.stage = input.stage
  if (input.probability !== undefined) patch.probability = input.probability
  if (input.expectedCloseDate !== undefined) {
    patch.expected_close_date = input.expectedCloseDate || null
  }
  if (input.notes !== undefined) patch.notes = input.notes

  const { data, error } = await supabase
    .from("crm_deals")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to update deal")
  }

  await touchClientActivity(data.client_id)
  const names = await loadClientNames([data.client_id])
  return mapDealRow(data, names.get(data.client_id) ?? "Unknown client")
}

export async function deleteDeal(id: string) {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from("crm_deals")
    .select("client_id")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("crm_deals").delete().eq("id", id)
  if (error) throw error

  if (existing?.client_id) {
    await touchClientActivity(existing.client_id)
  }
}
