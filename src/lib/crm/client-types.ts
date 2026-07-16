export type ClientStatus = "active" | "inactive" | "archived"

export type ClientNoteView = {
  id: string
  content: string
  author: string
  date: string
  createdAt: string
}

export type ClientView = {
  id: string
  company: string
  industry: string
  product: string
  initials: string
  avatarClass: string
  avatarUrl: string | null
  contact: string
  role: string
  email: string
  phone: string
  website: string
  location: string
  companySize: string
  clientSince: string
  status: ClientStatus
  lastActivity: string
  createdAt: string
  updatedAt: string
  notes: ClientNoteView[]
}

export const CLIENT_STATUSES = new Set<ClientStatus>([
  "active",
  "inactive",
  "archived",
])

export const CLIENT_COMPANY_SIZES = [
  "1 - 10 employees",
  "11 - 50 employees",
  "51 - 200 employees",
  "201 - 500 employees",
  "500+ employees",
] as const

const AVATAR_CLASSES = [
  "bg-blue-600 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-400 text-zinc-950",
  "bg-cyan-500 text-white",
  "bg-purple-500 text-white",
  "bg-rose-500 text-white",
  "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
]

export function getClientInitials(company: string) {
  const parts = company.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "C"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function getClientAvatarClass(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_CLASSES.length
  }
  return AVATAR_CLASSES[hash] ?? AVATAR_CLASSES[0]
}

export function formatClientWebsite(website: string | null | undefined) {
  const value = website?.trim().replace(/^https?:\/\//i, "") ?? ""
  return value || "—"
}

export function clientWebsiteHref(website: string) {
  if (!website || website === "—") return null
  return website.startsWith("http") ? website : `https://${website}`
}
