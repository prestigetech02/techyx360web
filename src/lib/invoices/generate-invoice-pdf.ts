import "server-only"

import type { Browser } from "puppeteer-core"

import type { InvoiceWithItems } from "@/lib/invoices/types"

const WINDOWS_CHROME_PATHS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean) as string[]

async function launchWithSparticuz(
  puppeteer: typeof import("puppeteer-core")
): Promise<Browser> {
  const chromium = await import("@sparticuz/chromium")

  return puppeteer.default.launch({
    args: chromium.default.args,
    executablePath: await chromium.default.executablePath(),
    headless: true,
  })
}

async function launchWithSystemChrome(
  puppeteer: typeof import("puppeteer-core")
): Promise<Browser | null> {
  const { existsSync } = await import("node:fs")

  for (const executablePath of WINDOWS_CHROME_PATHS) {
    if (!existsSync(executablePath)) continue

    return puppeteer.default.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  }

  return null
}

async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core")

  try {
    return await launchWithSparticuz(puppeteer)
  } catch (error) {
    console.warn("Sparticuz Chromium launch failed, trying system Chrome", error)
  }

  const systemBrowser = await launchWithSystemChrome(puppeteer)
  if (systemBrowser) {
    return systemBrowser
  }

  throw new Error(
    "No Chromium runtime available for PDF generation. Install Google Chrome locally or set CHROME_PATH."
  )
}

export async function generateInvoicePdf(
  invoice: InvoiceWithItems,
  options?: { baseUrl?: string }
) {
  const { renderInvoiceHtml } = await import("@/lib/invoices/render-invoice-html")
  const html = renderInvoiceHtml(invoice, options)
  const browser = await launchBrowser()

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "load" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
      },
    })

    await page.close()
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
