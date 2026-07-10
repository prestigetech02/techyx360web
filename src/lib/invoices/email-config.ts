export function isInvoiceEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}
