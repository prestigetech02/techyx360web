import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { InvoiceRow, InvoiceWithItems } from "@/lib/invoices/types"

export async function getAdminInvoices(): Promise<InvoiceRow[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load invoices", error)
    return []
  }

  return data ?? []
}

export async function getInvoiceById(
  id: string
): Promise<InvoiceWithItems | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*, line_items:invoice_line_items(*)")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load invoice", error)
    return null
  }

  return (data as InvoiceWithItems | null) ?? null
}

/** Count of invoices created in the given year, used for sequential numbering. */
export async function getInvoiceCountForYear(year: number): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01T00:00:00Z`)
    .lt("created_at", `${year + 1}-01-01T00:00:00Z`)

  if (error) {
    console.error("Failed to count invoices", error)
    return 0
  }

  return count ?? 0
}
