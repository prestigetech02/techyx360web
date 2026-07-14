import { contactDetails } from "@/config/contact"

export type CareerOpenPosition = {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  overview: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  benefits: string[]
  status: "Open" | "Closed"
  icon: "code" | "design" | "product" | "support"
  postedAt: string
  /** Monthly salary lower bound in NGN, if disclosed */
  salaryMin: number | null
  /** Monthly salary upper bound in NGN, if disclosed */
  salaryMax: number | null
}

export const careerOpenPositions: CareerOpenPosition[] = [
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description:
      "Build and ship web platforms end-to-end — from APIs and databases to responsive user interfaces.",
    overview:
      "We're looking for a Full Stack Developer who can own features across the stack. You'll work with designers, product, and fellow engineers to ship reliable software for businesses and learners across Nigeria and Africa.",
    responsibilities: [
      "Design, build, and maintain web applications using modern frontend and backend stacks",
      "Write clean, well-tested code and participate in code reviews",
      "Collaborate with design and product to turn requirements into shipped features",
      "Improve performance, accessibility, and reliability across our products",
      "Help shape engineering practices, documentation, and technical decisions",
    ],
    requirements: [
      "Solid experience with JavaScript/TypeScript and a modern frontend framework (React or Next.js preferred)",
      "Backend experience with APIs, databases, and authentication",
      "Comfort working across the stack and debugging production issues",
      "Clear communication and a collaborative approach to shipping",
      "Strong problem-solving skills and attention to detail",
    ],
    niceToHave: [
      "Experience with Next.js App Router and Tailwind CSS",
      "Familiarity with cloud deployment and CI/CD",
      "Prior work on SaaS, training platforms, or marketplace products",
    ],
    benefits: [
      "Competitive salary and performance incentives",
      "Remote & hybrid work flexibility",
      "Mentorship and continuous learning opportunities",
      "Direct impact on products used by businesses and learners",
    ],
    status: "Open",
    icon: "code",
    postedAt: "2026-07-14T10:00:00.000Z",
    salaryMin: 400000,
    salaryMax: 800000,
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    department: "Product",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description:
      "Design clear, accessible product experiences across our software suite and training platforms.",
    overview:
      "Join Techyx360 as a UI/UX Designer and shape experiences that help people learn, hire, and build with technology. You'll own end-to-end design — research, flows, interfaces, and design systems — across our products.",
    responsibilities: [
      "Design user flows, wireframes, and high-fidelity interfaces for web and product experiences",
      "Run lightweight research and usability checks to validate design decisions",
      "Maintain and evolve our design system for consistency across products",
      "Partner closely with engineers and product managers through the delivery cycle",
      "Advocate for accessibility, clarity, and polished interaction design",
    ],
    requirements: [
      "Proven UI/UX design experience with a strong portfolio of shipped work",
      "Proficiency in Figma and modern design workflows",
      "Ability to translate complex requirements into simple, usable interfaces",
      "Experience collaborating with engineering teams",
      "Understanding of responsive design and accessibility fundamentals",
    ],
    niceToHave: [
      "Experience designing learning, SaaS, or career products",
      "Basic familiarity with HTML/CSS or design-in-browser handoff",
      "Motion or micro-interaction design experience",
    ],
    benefits: [
      "Competitive salary and performance incentives",
      "Remote & hybrid work flexibility",
      "Mentorship and continuous learning opportunities",
      "Ownership of meaningful product surfaces from day one",
    ],
    status: "Open",
    icon: "design",
    postedAt: "2026-07-13T10:00:00.000Z",
    salaryMin: 300000,
    salaryMax: 600000,
  },
  {
    id: "product-manager",
    title: "Product Manager",
    department: "Product",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description:
      "Own product direction, prioritize roadmaps, and work closely with engineering and design to ship value.",
    overview:
      "We're hiring a Product Manager to drive clarity and outcomes across Techyx360 products. You'll define priorities, align teams, and make sure we ship solutions that create real impact for customers.",
    responsibilities: [
      "Own product discovery, prioritization, and roadmap planning",
      "Write clear specs and success metrics for features and initiatives",
      "Work daily with engineering and design to deliver high-quality releases",
      "Gather customer feedback and turn insights into actionable product decisions",
      "Communicate progress, risks, and outcomes to stakeholders",
    ],
    requirements: [
      "Experience as a Product Manager or similar product ownership role",
      "Strong written and verbal communication skills",
      "Ability to balance customer needs, business goals, and technical constraints",
      "Comfort working with data to guide decisions",
      "Experience shipping digital products in partnership with engineering teams",
    ],
    niceToHave: [
      "Background in SaaS, edtech, or marketplace products",
      "Familiarity with agile delivery and product analytics tools",
      "Experience working with early-stage or growing product teams",
    ],
    benefits: [
      "Competitive salary and performance incentives",
      "Remote & hybrid work flexibility",
      "Mentorship and continuous learning opportunities",
      "High ownership and visibility across the business",
    ],
    status: "Open",
    icon: "product",
    postedAt: "2026-07-12T10:00:00.000Z",
    salaryMin: 450000,
    salaryMax: 900000,
  },
  {
    id: "technical-support-specialist",
    title: "Technical Support Specialist",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description:
      "Help customers succeed by resolving technical issues and guiding them through Techyx360 products.",
    overview:
      "As a Technical Support Specialist, you'll be the trusted guide for our customers. You'll troubleshoot issues, explain product workflows clearly, and feed insights back to product and engineering so we keep improving.",
    responsibilities: [
      "Respond to customer requests across email and support channels with clarity and care",
      "Diagnose and resolve technical issues across our software and training platforms",
      "Document common problems, solutions, and product feedback",
      "Escalate complex issues and collaborate with engineering when needed",
      "Help create help articles and onboarding resources that reduce repeat issues",
    ],
    requirements: [
      "Strong customer communication skills and patience under pressure",
      "Ability to troubleshoot software issues methodically",
      "Comfort learning new tools and explaining technical concepts simply",
      "Reliable remote work habits and strong written English",
      "Experience in technical support, customer success, or a related role",
    ],
    niceToHave: [
      "Familiarity with web apps, CRM tools, or helpdesk platforms",
      "Background supporting SaaS or education products",
      "Basic understanding of HTML, APIs, or browser developer tools",
    ],
    benefits: [
      "Competitive salary and performance incentives",
      "Fully remote-friendly work setup",
      "Mentorship and continuous learning opportunities",
      "Clear path to grow into customer success or product support leadership",
    ],
    status: "Open",
    icon: "support",
    postedAt: "2026-07-11T10:00:00.000Z",
    salaryMin: 200000,
    salaryMax: 400000,
  },
]

export function formatCareerPostedAt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

export function formatCareerSalaryAmount(amount: number) {
  return nairaFormatter.format(amount)
}

export function formatCareerSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null
) {
  if (salaryMin == null && salaryMax == null) return null
  if (salaryMin != null && salaryMax != null) {
    if (salaryMin === salaryMax) {
      return `${formatCareerSalaryAmount(salaryMin)} / month`
    }
    return `${formatCareerSalaryAmount(salaryMin)} – ${formatCareerSalaryAmount(salaryMax)} / month`
  }
  if (salaryMin != null) {
    return `From ${formatCareerSalaryAmount(salaryMin)} / month`
  }
  return `Up to ${formatCareerSalaryAmount(salaryMax!)} / month`
}

export const careerDatePostedFilterOptions = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Past 24 hours", days: 1 },
  { value: "week", label: "Past week", days: 7 },
  { value: "month", label: "Past month", days: 30 },
  { value: "3months", label: "Past 3 months", days: 90 },
] as const

export const careerSalaryRangeFilterOptions = [
  { value: "any", label: "Any salary", min: 0, max: Number.POSITIVE_INFINITY },
  {
    value: "under-200k",
    label: "Under ₦200,000",
    min: 0,
    max: 199_999,
  },
  {
    value: "200k-500k",
    label: "₦200,000 – ₦500,000",
    min: 200_000,
    max: 500_000,
  },
  {
    value: "500k-1m",
    label: "₦500,000 – ₦1,000,000",
    min: 500_000,
    max: 1_000_000,
  },
  {
    value: "1m-plus",
    label: "₦1,000,000+",
    min: 1_000_000,
    max: Number.POSITIVE_INFINITY,
  },
] as const

export function matchesCareerDatePostedFilter(
  postedAt: string,
  filterValue: string
) {
  if (filterValue === "any") return true

  const option = careerDatePostedFilterOptions.find(
    (item) => item.value === filterValue
  )
  if (!option || !("days" in option)) return true

  const cutoff = Date.now() - option.days * 24 * 60 * 60 * 1000
  return new Date(postedAt).getTime() >= cutoff
}

export function matchesCareerSalaryRangeFilter(
  salaryMin: number | null,
  salaryMax: number | null,
  filterValue: string
) {
  if (filterValue === "any") return true

  const option = careerSalaryRangeFilterOptions.find(
    (item) => item.value === filterValue
  )
  if (!option || option.value === "any") return true

  if (salaryMin == null && salaryMax == null) return false

  const positionMin = salaryMin ?? 0
  const positionMax = salaryMax ?? Number.POSITIVE_INFINITY

  return positionMax >= option.min && positionMin <= option.max
}

export function getCareerFilterOptions(positions: CareerOpenPosition[]) {
  return {
    departments: [
      "All Departments",
      ...Array.from(
        new Set(positions.map((position) => position.department))
      ).sort(),
    ],
    locations: [
      "All Locations",
      ...Array.from(
        new Set(positions.map((position) => position.location))
      ).sort(),
    ],
    jobTypes: [
      "Job Type",
      ...Array.from(new Set(positions.map((position) => position.type))).sort(),
    ],
    datePosted: careerDatePostedFilterOptions.map((option) => ({
      value: option.value,
      label: option.label,
    })),
    salaryRanges: careerSalaryRangeFilterOptions.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  }
}

export function getCareerPositionById(id: string) {
  return careerOpenPositions.find((position) => position.id === id)
}

export function getOtherCareerPositions(currentId: string, limit = 3) {
  return careerOpenPositions
    .filter((position) => position.id !== currentId && position.status === "Open")
    .slice(0, limit)
}

export function getCareerApplyMailto(title: string) {
  return `mailto:${contactDetails.email}?subject=${encodeURIComponent(
    `Application - ${title} | Techyx360 Careers`
  )}`
}

export const careerEmploymentTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
] as const

export type CareerEmploymentType =
  (typeof careerEmploymentTypeOptions)[number]["value"]

export function isCareerEmploymentType(
  value: string
): value is CareerEmploymentType {
  return careerEmploymentTypeOptions.some((option) => option.value === value)
}

export const careerExperienceOptions = [
  { value: "0-1", label: "0–1 years" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-8", label: "5–8 years" },
  { value: "8+", label: "8+ years" },
] as const

export const careerAvailabilityOptions = [
  { value: "immediate", label: "Immediate" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "1-month", label: "Within 1 month" },
  { value: "more-than-1-month", label: "More than 1 month" },
] as const

export const careerDepartments = [
  "All Departments",
  ...Array.from(
    new Set(careerOpenPositions.map((position) => position.department))
  ).sort(),
] as const

export const careerLocations = [
  "All Locations",
  ...Array.from(
    new Set(careerOpenPositions.map((position) => position.location))
  ).sort(),
] as const

export const careerJobTypes = [
  "Job Type",
  ...Array.from(
    new Set(careerOpenPositions.map((position) => position.type))
  ).sort(),
] as const

export type CareerHighlight = {
  id: string
  value: string
  label: string
  icon: "briefcase" | "rocket" | "graduation" | "globe"
}

export const careerHighlights: CareerHighlight[] = [
  {
    id: "opportunities",
    value: "Clear Paths",
    label: "Career Growth & Mentorship",
    icon: "briefcase",
  },
  {
    id: "products",
    value: "20+",
    label: "Products Delivered",
    icon: "rocket",
  },
  {
    id: "talents",
    value: "200+",
    label: "Talents Trained & Mentored",
    icon: "graduation",
  },
  {
    id: "environment",
    value: "Remote & Hybrid",
    label: "Work Environment",
    icon: "globe",
  },
]
