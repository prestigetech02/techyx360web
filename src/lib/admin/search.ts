import "server-only"

import { adminNavItems } from "@/config/admin-nav"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { AdminSearchResult } from "@/types/admin-search"

const PER_SOURCE_LIMIT = 4
const MAX_RESULTS = 20

function toIlikePattern(query: string) {
  const safe = query.trim().replace(/[%_]/g, " ").replace(/\s+/g, " ").trim()
  return `%${safe}%`
}

function matchesText(query: string, ...parts: Array<string | null | undefined>) {
  const needle = query.trim().toLowerCase()
  if (!needle) return false
  const haystack = parts.filter(Boolean).join(" ").toLowerCase()
  if (haystack.includes(needle)) return true
  return needle.split(/\s+/).every((word) => haystack.includes(word))
}

function getAdminPageResults(query: string): AdminSearchResult[] {
  const results: AdminSearchResult[] = []

  for (const item of adminNavItems) {
    if (item.href && !item.comingSoon && matchesText(query, item.label, "admin")) {
      results.push({
        id: `page-${item.href}`,
        title: item.label,
        description: "Admin page",
        href: item.href,
        category: "Page",
      })
    }

    for (const child of item.children ?? []) {
      if (
        child.href &&
        !child.comingSoon &&
        matchesText(query, child.label, item.label)
      ) {
        results.push({
          id: `page-${child.href}`,
          title: child.label,
          description: item.label,
          href: child.href,
          category: "Page",
        })
      }

      for (const leaf of child.children ?? []) {
        if (
          leaf.href &&
          !leaf.comingSoon &&
          matchesText(query, leaf.label, child.label, item.label)
        ) {
          results.push({
            id: `page-${leaf.href}`,
            title: leaf.label,
            description: `${item.label} · ${child.label}`,
            href: leaf.href,
            category: "Page",
          })
        }
      }
    }
  }

  return results.slice(0, PER_SOURCE_LIMIT)
}

export async function searchAdminDashboard(
  query: string
): Promise<AdminSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return []
  }

  const pageResults = getAdminPageResults(trimmed)

  if (!isSupabaseConfigured()) {
    return pageResults.slice(0, MAX_RESULTS)
  }

  const supabase = createAdminClient()
  const pattern = toIlikePattern(trimmed)
  const p = `"${pattern}"`

  const [
    leadsResult,
    clientsResult,
    contactsResult,
    registrationsResult,
    pifResult,
    careersResult,
    talentResult,
    teamResult,
    projectsResult,
    invoicesResult,
    blogResult,
  ] = await Promise.all([
    supabase
      .from("crm_leads")
      .select("id, full_name, email, company, source")
      .or(
        `full_name.ilike.${p},email.ilike.${p},company.ilike.${p},phone.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("crm_clients")
      .select("id, company, contact_name, email, industry")
      .or(
        `company.ilike.${p},contact_name.ilike.${p},email.ilike.${p},phone.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("contact_submissions")
      .select("id, first_name, last_name, email, message")
      .or(
        `first_name.ilike.${p},last_name.ilike.${p},email.ilike.${p},message.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("course_registrations")
      .select("id, first_name, last_name, email, course_title")
      .or(
        `first_name.ilike.${p},last_name.ilike.${p},email.ilike.${p},course_title.ilike.${p},phone.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("pif_applications")
      .select("id, first_name, last_name, email, preferred_track")
      .or(
        `first_name.ilike.${p},last_name.ilike.${p},email.ilike.${p},preferred_track.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("career_applications")
      .select("id, full_name, email, position_title")
      .or(
        `full_name.ilike.${p},email.ilike.${p},position_title.ilike.${p},phone.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("talent_pool_submissions")
      .select("id, full_name, email, interest_areas, location")
      .or(
        `full_name.ilike.${p},email.ilike.${p},interest_areas.ilike.${p},location.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("team_members")
      .select("id, full_name, email, role, department")
      .or(
        `full_name.ilike.${p},email.ilike.${p},role.ilike.${p},department.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("crm_projects")
      .select("id, name, category, description, status")
      .or(`name.ilike.${p},category.ilike.${p},description.ilike.${p}`)
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("invoices")
      .select("id, invoice_number, title, client_name, client_email, status")
      .or(
        `invoice_number.ilike.${p},title.ilike.${p},client_name.ilike.${p},client_email.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from("blog_posts")
      .select("id, title, excerpt, slug, author")
      .or(
        `title.ilike.${p},excerpt.ilike.${p},author.ilike.${p},slug.ilike.${p}`
      )
      .limit(PER_SOURCE_LIMIT),
  ])

  for (const result of [
    leadsResult,
    clientsResult,
    contactsResult,
    registrationsResult,
    pifResult,
    careersResult,
    talentResult,
    teamResult,
    projectsResult,
    invoicesResult,
    blogResult,
  ]) {
    if (result.error) {
      console.error("Admin search query error", result.error)
    }
  }

  const leads: AdminSearchResult[] = (leadsResult.data ?? []).map((row) => ({
    id: `lead:${row.id}`,
    title: row.full_name,
    description: [row.company, row.email, row.source].filter(Boolean).join(" · "),
    href: "/admin/leads",
    category: "Lead",
  }))

  const clients: AdminSearchResult[] = (clientsResult.data ?? []).map((row) => ({
    id: `client:${row.id}`,
    title: row.company,
    description: [row.contact_name, row.email, row.industry]
      .filter(Boolean)
      .join(" · "),
    href: "/admin/clients",
    category: "Client",
  }))

  const contacts: AdminSearchResult[] = (contactsResult.data ?? []).map(
    (row) => ({
      id: `contact:${row.id}`,
      title: `${row.first_name} ${row.last_name}`.trim(),
      description: row.message?.slice(0, 100) || row.email,
      href: "/admin/contact",
      category: "Contact",
    })
  )

  const registrations: AdminSearchResult[] = (
    registrationsResult.data ?? []
  ).map((row) => ({
    id: `registration:${row.id}`,
    title: `${row.first_name} ${row.last_name}`.trim(),
    description: row.course_title || row.email,
    href: "/admin/registrations",
    category: "Registration",
  }))

  const pif: AdminSearchResult[] = (pifResult.data ?? []).map((row) => ({
    id: `pif:${row.id}`,
    title: `${row.first_name} ${row.last_name}`.trim(),
    description: row.preferred_track || row.email,
    href: "/admin/submissions/pif-applications",
    category: "PIF",
  }))

  const careers: AdminSearchResult[] = (careersResult.data ?? []).map((row) => ({
    id: `career:${row.id}`,
    title: row.full_name,
    description: row.position_title || row.email,
    href: "/admin/job-applications",
    category: "Career",
  }))

  const talent: AdminSearchResult[] = (talentResult.data ?? []).map((row) => ({
    id: `talent:${row.id}`,
    title: row.full_name,
    description: [row.interest_areas, row.location, row.email]
      .filter(Boolean)
      .join(" · "),
    href: "/admin/talent-pool",
    category: "Talent",
  }))

  const team: AdminSearchResult[] = (teamResult.data ?? []).map((row) => ({
    id: `team:${row.id}`,
    title: row.full_name,
    description: [row.role, row.department, row.email]
      .filter(Boolean)
      .join(" · "),
    href: "/admin/team",
    category: "Team",
  }))

  const projects: AdminSearchResult[] = (projectsResult.data ?? []).map(
    (row) => ({
      id: `project:${row.id}`,
      title: row.name,
      description: [row.category, row.status, row.description]
        .filter(Boolean)
        .join(" · ")
        .slice(0, 120),
      href: "/admin/projects",
      category: "Project",
    })
  )

  const invoices: AdminSearchResult[] = (invoicesResult.data ?? []).map(
    (row) => ({
      id: `invoice:${row.id}`,
      title: row.invoice_number,
      description: [row.client_name, row.title, row.status]
        .filter(Boolean)
        .join(" · "),
      href: "/admin/invoices",
      category: "Invoice",
    })
  )

  const blog: AdminSearchResult[] = (blogResult.data ?? []).map((row) => ({
    id: `blog:${row.id}`,
    title: row.title,
    description: row.excerpt?.slice(0, 100) || row.author,
    href: "/admin/blog",
    category: "Blog",
  }))

  return [
    ...pageResults,
    ...leads,
    ...clients,
    ...contacts,
    ...registrations,
    ...pif,
    ...careers,
    ...talent,
    ...team,
    ...projects,
    ...invoices,
    ...blog,
  ].slice(0, MAX_RESULTS)
}
