export type AdminSearchCategory =
  | "Page"
  | "Lead"
  | "Client"
  | "Contact"
  | "Registration"
  | "PIF"
  | "Career"
  | "Talent"
  | "Team"
  | "Project"
  | "Invoice"
  | "Blog"

export type AdminSearchResult = {
  id: string
  title: string
  description: string
  href: string
  category: AdminSearchCategory
}
