import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type TalentRequestRow =
  Database["public"]["Tables"]["talent_requests"]["Row"]

export async function getAllTalentRequests(): Promise<TalentRequestRow[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("talent_requests")
    .select(
      "id, first_name, last_name, email, phone, company, role_needed, engagement_type, headcount, duration, details, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("Failed to load talent requests", error)
    throw new Error("Unable to load talent requests.")
  }

  return data ?? []
}
