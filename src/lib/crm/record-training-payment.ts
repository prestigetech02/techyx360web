import "server-only"

import { createPayment, type CreatePaymentInput } from "@/lib/crm/payments"
import type { PaymentMethod, PaymentPurpose } from "@/lib/crm/payment-types"
import { createAdminClient } from "@/lib/supabase/admin"

export type RecordTrainingPaymentInput = {
  amount: number
  paidAt: string
  method?: PaymentMethod
  reference?: string
  notes?: string
}

function isMissingLinkColumnError(error: { message?: string } | null) {
  const message = error?.message ?? ""
  return (
    message.includes("course_registration_id") ||
    message.includes("pif_application_id") ||
    message.includes("crm_payments")
  )
}

export async function getFinancePaymentIdsForCourseRegistrations(
  registrationIds: string[]
) {
  const ids = [...new Set(registrationIds.filter(Boolean))]
  const map = new Map<string, string>()
  if (ids.length === 0) return map

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_payments")
    .select("id, course_registration_id")
    .in("course_registration_id", ids)

  if (error) {
    if (isMissingLinkColumnError(error)) return map
    throw error
  }

  for (const row of data ?? []) {
    if (row.course_registration_id) {
      map.set(row.course_registration_id, row.id)
    }
  }
  return map
}

export async function getFinancePaymentIdsForPifApplications(
  applicationIds: string[]
) {
  const ids = [...new Set(applicationIds.filter(Boolean))]
  const map = new Map<string, string>()
  if (ids.length === 0) return map

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_payments")
    .select("id, pif_application_id")
    .in("pif_application_id", ids)

  if (error) {
    if (isMissingLinkColumnError(error)) return map
    throw error
  }

  for (const row of data ?? []) {
    if (row.pif_application_id) {
      map.set(row.pif_application_id, row.id)
    }
  }
  return map
}

async function assertNotAlreadyLinked(
  column: "course_registration_id" | "pif_application_id",
  sourceId: string
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_payments")
    .select("id")
    .eq(column, sourceId)
    .maybeSingle()

  if (error) {
    if (isMissingLinkColumnError(error)) {
      throw new Error(
        "Run supabase/crm-payments-registration-links.sql in Supabase first."
      )
    }
    throw error
  }

  if (data?.id) {
    throw new Error("This submission is already recorded in finance.")
  }
}

export async function recordCourseRegistrationPayment(
  registrationId: string,
  input: RecordTrainingPaymentInput
) {
  const supabase = createAdminClient()
  const { data: registration, error } = await supabase
    .from("course_registrations")
    .select(
      "id, first_name, last_name, email, course_title, course_slug, payment_receipt_path, created_at"
    )
    .eq("id", registrationId)
    .maybeSingle()

  if (error) throw error
  if (!registration) {
    throw new Error("Registration not found.")
  }
  if (!registration.payment_receipt_path) {
    throw new Error(
      "This registration has no payment receipt. Only paid course submissions can be recorded."
    )
  }

  await assertNotAlreadyLinked("course_registration_id", registrationId)

  const fullName = `${registration.first_name} ${registration.last_name}`.trim()
  const purpose: PaymentPurpose = "training"
  const payload: CreatePaymentInput = {
    courseRegistrationId: registrationId,
    amount: input.amount,
    method: input.method ?? "bank_transfer",
    status: "completed",
    direction: "inbound",
    purpose,
    paidAt: input.paidAt,
    reference: input.reference?.trim() || fullName,
    description: `${registration.course_title} fee — ${fullName}`,
    notes:
      input.notes?.trim() ||
      `From course registration ${registrationId} (${registration.email})`,
  }

  try {
    return await createPayment(payload)
  } catch (createError) {
    const message =
      createError instanceof Error ? createError.message : String(createError)
    if (
      message.includes("crm_payments_course_registration_id_unique") ||
      message.includes("duplicate key")
    ) {
      throw new Error("This registration is already recorded in finance.")
    }
    if (isMissingLinkColumnError({ message })) {
      throw new Error(
        "Run supabase/crm-payments-registration-links.sql in Supabase first."
      )
    }
    throw createError
  }
}

export async function recordPifApplicationPayment(
  applicationId: string,
  input: RecordTrainingPaymentInput
) {
  const supabase = createAdminClient()
  const { data: application, error } = await supabase
    .from("pif_applications")
    .select(
      "id, first_name, last_name, email, preferred_track, payment_receipt_path, created_at"
    )
    .eq("id", applicationId)
    .maybeSingle()

  if (error) throw error
  if (!application) {
    throw new Error("PIF application not found.")
  }
  if (!application.payment_receipt_path) {
    throw new Error(
      "This application has no payment receipt. Only paid applications can be recorded."
    )
  }

  await assertNotAlreadyLinked("pif_application_id", applicationId)

  const fullName = `${application.first_name} ${application.last_name}`.trim()
  const purpose: PaymentPurpose = "pif"
  const payload: CreatePaymentInput = {
    pifApplicationId: applicationId,
    amount: input.amount,
    method: input.method ?? "bank_transfer",
    status: "completed",
    direction: "inbound",
    purpose,
    paidAt: input.paidAt,
    reference: input.reference?.trim() || fullName,
    description: `PIF fee (${application.preferred_track}) — ${fullName}`,
    notes:
      input.notes?.trim() ||
      `From PIF application ${applicationId} (${application.email})`,
  }

  try {
    return await createPayment(payload)
  } catch (createError) {
    const message =
      createError instanceof Error ? createError.message : String(createError)
    if (
      message.includes("crm_payments_pif_application_id_unique") ||
      message.includes("duplicate key")
    ) {
      throw new Error("This application is already recorded in finance.")
    }
    if (isMissingLinkColumnError({ message })) {
      throw new Error(
        "Run supabase/crm-payments-registration-links.sql in Supabase first."
      )
    }
    throw createError
  }
}
