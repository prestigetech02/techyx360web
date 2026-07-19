import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "registration-receipts"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && ["jpg", "jpeg", "png", "webp", "pdf"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "application/pdf":
      return "pdf"
    default:
      return "jpg"
  }
}

export async function uploadRegistrationReceipt(
  file: File,
  folderPath: string
) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      error: "Only JPG, PNG, WebP, and PDF files are allowed for payment receipts.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Payment receipt must be 5 MB or smaller." }
  }

  const extension = getFileExtension(file)
  const objectPath = `${folderPath}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, fileBuffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    console.error("Failed to upload registration receipt", error)

    if (
      error.message?.toLowerCase().includes("bucket not found") ||
      (error as { statusCode?: string }).statusCode === "404"
    ) {
      return {
        error:
          "Receipt upload is not configured yet. Please contact support or try again later.",
      }
    }

    return { error: "Unable to upload your payment receipt right now." }
  }

  return { path: objectPath }
}

export async function getRegistrationReceiptSignedUrl(
  path: string,
  expiresInSeconds = 60 * 60
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)

  if (error) {
    console.error("Failed to create receipt signed URL", error)
    return null
  }

  return data.signedUrl
}
