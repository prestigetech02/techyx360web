import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "career-cvs"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && ["pdf", "doc", "docx"].includes(fromName)) {
    return fromName
  }

  switch (file.type) {
    case "application/pdf":
      return "pdf"
    case "application/msword":
      return "doc"
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx"
    default:
      return "pdf"
  }
}

export async function uploadCareerCv(file: File, positionId: string) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      error: "Only PDF, DOC, and DOCX files are allowed for CV uploads.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "CV must be 5 MB or smaller." }
  }

  const extension = getFileExtension(file)
  const objectPath = `${positionId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, fileBuffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    console.error("Failed to upload career CV", error)

    if (
      error.message?.toLowerCase().includes("bucket not found") ||
      (error as { statusCode?: string }).statusCode === "404"
    ) {
      return {
        error:
          "CV upload is not configured yet. Please contact support or try again later.",
      }
    }

    return { error: "Unable to upload your CV right now." }
  }

  return { path: objectPath }
}

export async function getCareerCvSignedUrl(
  path: string,
  expiresInSeconds = 60 * 60
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)

  if (error) {
    console.error("Failed to create career CV signed URL", error)
    return null
  }

  return data.signedUrl
}
