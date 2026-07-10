import { readFileSync } from "node:fs"
import { join } from "node:path"

let cachedStyles: string | null = null

export function getInvoiceDocumentStyles() {
  if (cachedStyles) return cachedStyles

  cachedStyles = readFileSync(
    join(process.cwd(), "src/styles/invoice-document.css"),
    "utf8"
  )

  return cachedStyles
}
