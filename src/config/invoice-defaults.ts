import type { InvoiceIssuer } from "@/components/invoices/document/invoice-header"

export const invoiceIssuerDefaults: InvoiceIssuer = {
  legalName: "360Technologies Ltd.",
  rcNumber: "7251076",
  logoUrl: "/techyx360-logo-black.webp",
  addressLines: [
    "8, Road B, Ladugba Estate",
    "Itaoluwo, Ikorodu, Lagos State",
    "ICrown Terrace, Vintage Est.,",
    "Sangotedo, Lekki, Lagos",
  ],
  website: "www.techyx360.com",
  email: "info@techyx360.com",
  phone: "+2349071682117, +2349128868892",
}

export const invoicePaymentDefaults = {
  bankName: "Wema Bank",
  accountNumber: "0126504893",
  accountName: "TechyX360 Technologies Ltd",
}

export const invoiceSignatureDefaults = {
  name: "Mujaideen Taiwo",
  title: "Techyx360 Team",
}

/** Standard Nigerian VAT rate applied when the per-invoice VAT option is enabled. */
export const DEFAULT_VAT_RATE = 7.5
