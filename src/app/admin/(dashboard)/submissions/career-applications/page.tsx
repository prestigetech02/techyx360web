import { redirect } from "next/navigation"

import { careerApplicationsAdminPath } from "@/config/admin-nav"

export default function AdminCareerApplicationsRedirectPage() {
  redirect(careerApplicationsAdminPath)
}
