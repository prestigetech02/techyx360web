import "server-only"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"
import type { LeadStatus } from "@/lib/crm/lead-types"

export type DashboardKpi = {
  key: string
  label: string
  value: number
  hint: string
  href: string
}

export type DashboardTrendPoint = {
  date: string
  label: string
  contacts: number
  registrations: number
  pif: number
  careers: number
  leads: number
  total: number
}

export type DashboardBreakdownItem = {
  key: string
  label: string
  value: number
  href: string
  color: string
}

export type DashboardPipelineItem = {
  status: LeadStatus
  label: string
  count: number
}

export type DashboardActivityItem = {
  id: string
  title: string
  subtitle: string
  type: string
  href: string
  createdAt: string
}

export type AdminDashboardData = {
  configured: boolean
  kpis: DashboardKpi[]
  unreadTotal: number
  trend: DashboardTrendPoint[]
  inboxBreakdown: DashboardBreakdownItem[]
  leadPipeline: DashboardPipelineItem[]
  leadSources: DashboardBreakdownItem[]
  recentActivity: DashboardActivityItem[]
}

const TREND_DAYS = 30

const PIPELINE_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
]

const PIPELINE_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
}

const SOURCE_COLORS = [
  "#2563eb",
  "#0d9488",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#059669",
  "#ea580c",
  "#64748b",
]

function startOfDayUtc(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

function formatDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00.000Z`)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

function emptyTrend(): DashboardTrendPoint[] {
  const today = startOfDayUtc(new Date())
  const points: DashboardTrendPoint[] = []

  for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setUTCDate(today.getUTCDate() - i)
    const date = formatDayKey(day)
    points.push({
      date,
      label: formatDayLabel(date),
      contacts: 0,
      registrations: 0,
      pif: 0,
      careers: 0,
      leads: 0,
      total: 0,
    })
  }

  return points
}

function bucketCounts(
  rows: Array<{ created_at: string } | null> | null,
  map: Map<string, number>
) {
  for (const row of rows ?? []) {
    if (!row?.created_at) continue
    const key = row.created_at.slice(0, 10)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
}

function emptyDashboard(): AdminDashboardData {
  return {
    configured: false,
    kpis: [
      {
        key: "registrations",
        label: "Registrations",
        value: 0,
        hint: "All course & training",
        href: "/admin/registrations",
      },
      {
        key: "contacts",
        label: "Contacts",
        value: 0,
        hint: "Enquiries received",
        href: "/admin/contact",
      },
      {
        key: "leads",
        label: "CRM Leads",
        value: 0,
        hint: "Pipeline total",
        href: "/admin/leads",
      },
      {
        key: "pif",
        label: "PIF Apps",
        value: 0,
        hint: "Fellowship applications",
        href: "/admin/submissions/pif-applications",
      },
      {
        key: "careers",
        label: "Job Apps",
        value: 0,
        hint: "Career applications",
        href: "/admin/job-applications",
      },
      {
        key: "clients",
        label: "Clients",
        value: 0,
        hint: "Active accounts",
        href: "/admin/clients",
      },
    ],
    unreadTotal: 0,
    trend: emptyTrend(),
    inboxBreakdown: [],
    leadPipeline: PIPELINE_ORDER.map((status) => ({
      status,
      label: PIPELINE_LABELS[status],
      count: 0,
    })),
    leadSources: [],
    recentActivity: [],
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const base = emptyDashboard()

  if (!isSupabaseConfigured()) {
    return base
  }

  const supabase = createAdminClient()
  const since = startOfDayUtc(new Date())
  since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1))
  const sinceIso = since.toISOString()

  const [
    registrationsCount,
    contactsCount,
    pifCount,
    careersCount,
    leadsCount,
    clientsCount,
    newRegistrations,
    newContacts,
    newPif,
    newCareers,
    newLeads,
    registrationDates,
    contactDates,
    pifDates,
    careerDates,
    leadDates,
    leadStatuses,
    leadSources,
    recentRegistrations,
    recentContacts,
    recentPif,
    recentCareers,
    recentLeads,
  ] = await Promise.all([
    supabase
      .from("course_registrations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("pif_applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("career_applications")
      .select("id", { count: "exact", head: true }),
    supabase.from("crm_leads").select("id", { count: "exact", head: true }),
    supabase.from("crm_clients").select("id", { count: "exact", head: true }),
    supabase
      .from("course_registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("pif_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("career_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("crm_leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("course_registrations")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("contact_submissions")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("pif_applications")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("career_applications")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("crm_leads")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase.from("crm_leads").select("status"),
    supabase.from("crm_leads").select("source"),
    supabase
      .from("course_registrations")
      .select("id, first_name, last_name, email, course_title, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("contact_submissions")
      .select("id, first_name, last_name, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("pif_applications")
      .select("id, first_name, last_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("career_applications")
      .select("id, full_name, email, position_title, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("crm_leads")
      .select("id, full_name, email, company, source, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const regTotal = registrationsCount.error ? 0 : (registrationsCount.count ?? 0)
  const contactTotal = contactsCount.error ? 0 : (contactsCount.count ?? 0)
  const pifTotal = pifCount.error ? 0 : (pifCount.count ?? 0)
  const careerTotal = careersCount.error ? 0 : (careersCount.count ?? 0)
  const leadTotal = leadsCount.error ? 0 : (leadsCount.count ?? 0)
  const clientTotal = clientsCount.error ? 0 : (clientsCount.count ?? 0)

  const unread =
    (newRegistrations.error ? 0 : (newRegistrations.count ?? 0)) +
    (newContacts.error ? 0 : (newContacts.count ?? 0)) +
    (newPif.error ? 0 : (newPif.count ?? 0)) +
    (newCareers.error ? 0 : (newCareers.count ?? 0)) +
    (newLeads.error ? 0 : (newLeads.count ?? 0))

  const contactMap = new Map<string, number>()
  const registrationMap = new Map<string, number>()
  const pifMap = new Map<string, number>()
  const careerMap = new Map<string, number>()
  const leadMap = new Map<string, number>()

  bucketCounts(contactDates.data, contactMap)
  bucketCounts(registrationDates.data, registrationMap)
  bucketCounts(pifDates.data, pifMap)
  bucketCounts(careerDates.data, careerMap)
  bucketCounts(leadDates.data, leadMap)

  const trend = emptyTrend().map((point) => {
    const contacts = contactMap.get(point.date) ?? 0
    const registrations = registrationMap.get(point.date) ?? 0
    const pif = pifMap.get(point.date) ?? 0
    const careers = careerMap.get(point.date) ?? 0
    const leads = leadMap.get(point.date) ?? 0
    return {
      ...point,
      contacts,
      registrations,
      pif,
      careers,
      leads,
      total: contacts + registrations + pif + careers + leads,
    }
  })

  const inboxBreakdown: DashboardBreakdownItem[] = [
    {
      key: "contacts",
      label: "Contacts",
      value: contactTotal,
      href: "/admin/contact",
      color: "#2563eb",
    },
    {
      key: "registrations",
      label: "Registrations",
      value: regTotal,
      href: "/admin/registrations",
      color: "#0d9488",
    },
    {
      key: "pif",
      label: "PIF",
      value: pifTotal,
      href: "/admin/submissions/pif-applications",
      color: "#ca8a04",
    },
    {
      key: "careers",
      label: "Careers",
      value: careerTotal,
      href: "/admin/job-applications",
      color: "#db2777",
    },
    {
      key: "leads",
      label: "Leads",
      value: leadTotal,
      href: "/admin/leads",
      color: "#4f46e5",
    },
  ].filter((item) => item.value > 0)

  const statusCounts = new Map<LeadStatus, number>()
  for (const status of PIPELINE_ORDER) {
    statusCounts.set(status, 0)
  }
  for (const row of leadStatuses.data ?? []) {
    const status = row.status as LeadStatus
    if (statusCounts.has(status)) {
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    }
  }

  const leadPipeline = PIPELINE_ORDER.map((status) => ({
    status,
    label: PIPELINE_LABELS[status],
    count: statusCounts.get(status) ?? 0,
  }))

  const sourceCounts = new Map<string, number>()
  for (const row of leadSources.data ?? []) {
    const source = (row.source || "Other").trim() || "Other"
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  }

  const leadSourcesBreakdown = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value], index) => ({
      key: label,
      label,
      value,
      href: "/admin/leads",
      color: SOURCE_COLORS[index % SOURCE_COLORS.length],
    }))

  type RawActivity = {
    id: string
    title: string
    subtitle: string
    type: string
    href: string
    createdAt: string
  }

  const activity: RawActivity[] = []

  for (const row of recentContacts.data ?? []) {
    activity.push({
      id: `contact:${row.id}`,
      title: `${row.first_name} ${row.last_name}`.trim(),
      subtitle: row.message?.slice(0, 80) || row.email,
      type: "Contact",
      href: "/admin/contact",
      createdAt: row.created_at,
    })
  }

  for (const row of recentRegistrations.data ?? []) {
    activity.push({
      id: `registration:${row.id}`,
      title: `${row.first_name} ${row.last_name}`.trim(),
      subtitle: row.course_title || row.email,
      type: "Registration",
      href: "/admin/registrations",
      createdAt: row.created_at,
    })
  }

  for (const row of recentPif.data ?? []) {
    activity.push({
      id: `pif:${row.id}`,
      title: `${row.first_name} ${row.last_name}`.trim(),
      subtitle: row.email,
      type: "PIF",
      href: "/admin/submissions/pif-applications",
      createdAt: row.created_at,
    })
  }

  for (const row of recentCareers.data ?? []) {
    activity.push({
      id: `career:${row.id}`,
      title: row.full_name,
      subtitle: row.position_title || row.email,
      type: "Career",
      href: "/admin/job-applications",
      createdAt: row.created_at,
    })
  }

  for (const row of recentLeads.data ?? []) {
    activity.push({
      id: `lead:${row.id}`,
      title: row.full_name,
      subtitle: row.company || row.source || row.email,
      type: "Lead",
      href: "/admin/leads",
      createdAt: row.created_at,
    })
  }

  activity.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return {
    configured: true,
    kpis: [
      {
        key: "registrations",
        label: "Registrations",
        value: regTotal,
        hint: `${newRegistrations.error ? 0 : (newRegistrations.count ?? 0)} new`,
        href: "/admin/registrations",
      },
      {
        key: "contacts",
        label: "Contacts",
        value: contactTotal,
        hint: `${newContacts.error ? 0 : (newContacts.count ?? 0)} new`,
        href: "/admin/contact",
      },
      {
        key: "leads",
        label: "CRM Leads",
        value: leadTotal,
        hint: `${newLeads.error ? 0 : (newLeads.count ?? 0)} new`,
        href: "/admin/leads",
      },
      {
        key: "pif",
        label: "PIF Apps",
        value: pifTotal,
        hint: `${newPif.error ? 0 : (newPif.count ?? 0)} new`,
        href: "/admin/submissions/pif-applications",
      },
      {
        key: "careers",
        label: "Job Apps",
        value: careerTotal,
        hint: `${newCareers.error ? 0 : (newCareers.count ?? 0)} new`,
        href: "/admin/job-applications",
      },
      {
        key: "clients",
        label: "Clients",
        value: clientTotal,
        hint: "In CRM",
        href: "/admin/clients",
      },
    ],
    unreadTotal: unread,
    trend,
    inboxBreakdown:
      inboxBreakdown.length > 0
        ? inboxBreakdown
        : [
            {
              key: "empty",
              label: "No data yet",
              value: 1,
              href: "/admin",
              color: "#94a3b8",
            },
          ],
    leadPipeline,
    leadSources: leadSourcesBreakdown,
    recentActivity: activity.slice(0, 5),
  }
}
