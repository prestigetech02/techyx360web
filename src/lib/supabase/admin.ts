import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import {
  getSupabasePublicEnv,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/env"

/**
 * Server-only Supabase client with service role privileges.
 * Use for trusted backend tasks such as admin writes and form ingestion.
 */
export function createAdminClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey()

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for server-side admin operations."
    )
  }

  const { url } = getSupabasePublicEnv()

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
