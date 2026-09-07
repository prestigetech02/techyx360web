import { isTransactionalEmailConfigured } from "@/lib/email/zeptomail"

export function isInvoiceEmailConfigured() {
  return isTransactionalEmailConfigured()
}
