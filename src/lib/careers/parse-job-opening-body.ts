import { isRichTextEmpty } from "@/lib/blog/content"
import { slugify } from "@/lib/blog/posts"
import { parseCareerSalaryInput } from "@/lib/careers/salary"
import { isCareerEmploymentType } from "@/config/careers"

const ALLOWED_STATUSES = new Set(["open", "closed", "draft"])
const ALLOWED_ICONS = new Set([
  "code",
  "design",
  "product",
  "support",
  "briefcase",
])

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
  }

  if (typeof value !== "string") return []

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

export type ParsedJobOpeningBody = {
  slug: string
  title: string
  department: string
  location: string
  employment_type: string
  description: string
  overview: string
  responsibilities: string[]
  requirements: string[]
  nice_to_have: string[]
  benefits: string[]
  status: string
  icon: string
  salary_min: number | null
  salary_max: number | null
}

export type ParseJobOpeningResult =
  | { ok: true; data: ParsedJobOpeningBody }
  | { ok: false; error: string; status: number }

export function parseJobOpeningBody(
  body: Record<string, unknown>
): ParseJobOpeningResult {
  const title = sanitize(body.title)
  const department = sanitize(body.department)
  const location = sanitize(body.location)
  const employmentType = sanitize(body.employmentType)
  const description = sanitize(body.description)
  const overview = sanitize(body.overview)
  const status = sanitize(body.status).toLowerCase() || "open"
  const icon = sanitize(body.icon).toLowerCase() || "product"
  const slugInput = sanitize(body.slug)

  const responsibilities = parseList(body.responsibilities)
  const requirements = parseList(body.requirements)
  const niceToHave = parseList(body.niceToHave)
  const benefits = parseList(body.benefits)

  const salaryMin = parseCareerSalaryInput(body.salaryMin)
  const salaryMax = parseCareerSalaryInput(body.salaryMax)

  if (
    !title ||
    !department ||
    !location ||
    !employmentType ||
    !description ||
    isRichTextEmpty(overview)
  ) {
    return {
      ok: false,
      error: "Please complete all required fields.",
      status: 400,
    }
  }

  if (!isCareerEmploymentType(employmentType)) {
    return {
      ok: false,
      error: "Select a valid employment type.",
      status: 400,
    }
  }

  if (salaryMin === undefined || salaryMax === undefined) {
    return {
      ok: false,
      error: "Enter valid salary amounts (NGN per month), or leave blank.",
      status: 400,
    }
  }

  if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
    return {
      ok: false,
      error: "Salary min cannot be greater than salary max.",
      status: 400,
    }
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return { ok: false, error: "Invalid status.", status: 400 }
  }

  if (!ALLOWED_ICONS.has(icon)) {
    return { ok: false, error: "Invalid icon.", status: 400 }
  }

  const slug = slugify(slugInput || title)
  if (!slug) {
    return {
      ok: false,
      error: "Enter a valid slug for this listing.",
      status: 400,
    }
  }

  return {
    ok: true,
    data: {
      slug,
      title,
      department,
      location,
      employment_type: employmentType,
      description,
      overview,
      responsibilities,
      requirements,
      nice_to_have: niceToHave,
      benefits,
      status,
      icon,
      salary_min: salaryMin,
      salary_max: salaryMax,
    },
  }
}

export const JOB_OPENING_STATUSES = ALLOWED_STATUSES
