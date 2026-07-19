export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost"

export type LeadActivityType = "call" | "email" | "note" | "status" | "system"

export type LeadActivityView = {
  id: string
  type: LeadActivityType
  title: string
  timestamp: string
  author: string
  createdAt: string
}

export type LeadNoteView = {
  id: string
  content: string
  author: string
  date: string
  createdAt: string
}

export type LeadView = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  source: string
  status: LeadStatus
  initials: string
  avatarClass: string
  assignedTo: string
  score: number
  created: string
  createdAt: string
  clientId: string | null
  notes: LeadNoteView[]
  activities: LeadActivityView[]
}

export const LEAD_STATUSES = new Set<LeadStatus>([
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
])

export const LEAD_SOURCES = [
  "Website Form",
  "Referral",
  "LinkedIn",
  "Google Ads",
  "Facebook Ads",
  "Cold Call",
  "Event",
  "Other",
] as const

export const LEAD_ACTIVITY_TYPES = new Set<LeadActivityType>([
  "call",
  "email",
  "note",
  "status",
  "system",
])

const AVATAR_CLASSES = [
  "bg-blue-600 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-400 text-zinc-950",
  "bg-cyan-500 text-white",
  "bg-purple-500 text-white",
  "bg-rose-500 text-white",
  "bg-indigo-500 text-white",
]

export function getLeadInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "L"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function getLeadAvatarClass(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_CLASSES.length
  }
  return AVATAR_CLASSES[hash] ?? AVATAR_CLASSES[0]
}

export function statusChangeTitle(status: LeadStatus) {
  switch (status) {
    case "contacted":
      return "Marked as contacted"
    case "qualified":
      return "Marked as qualified"
    case "converted":
      return "Converted to client"
    case "lost":
      return "Marked as lost"
    case "new":
      return "Marked as new"
  }
}
