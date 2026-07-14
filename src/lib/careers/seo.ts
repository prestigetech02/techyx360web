import type { Metadata } from "next"

import type { CareerOpenPosition } from "@/config/careers"
import { brand, siteMetadata } from "@/config/brand"
import { isHtmlContent, stripHtmlTags } from "@/lib/blog/content"
import { absoluteUrl, createPageMetadata } from "@/lib/seo"
import { getJobPostingSchema } from "@/lib/structured-data"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function listToHtml(title: string, items: string[]) {
  if (!items.length) return ""

  const listItems = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")

  return `<h3>${escapeHtml(title)}</h3><ul>${listItems}</ul>`
}

export function getCareerSeoDescription(position: CareerOpenPosition) {
  const base = position.description.trim()
  const suffix = `${position.type} · ${position.location} · Apply at ${brand.name}`

  if (!base) return `${position.title} at ${brand.name}. ${suffix}.`

  const joined = `${base} ${suffix}.`
  return joined.length > 160 ? `${joined.slice(0, 157).trimEnd()}…` : joined
}

export function getCareerSeoKeywords(position: CareerOpenPosition) {
  const keywords = [
    `${position.title} ${brand.name}`,
    `${position.title} job Nigeria`,
    `${position.department} jobs Lagos`,
    `${position.type} tech jobs Nigeria`,
    `${brand.name} careers`,
    "tech jobs Nigeria",
    "IT jobs Lagos",
    ...siteMetadata.keywords.slice(0, 3),
  ]

  return Array.from(new Set(keywords.filter(Boolean)))
}

export function buildJobPostingDescriptionHtml(position: CareerOpenPosition) {
  const overviewHtml = isHtmlContent(position.overview)
    ? position.overview
    : `<p>${escapeHtml(position.overview)}</p>`

  return [
    `<p>${escapeHtml(position.description)}</p>`,
    overviewHtml,
    listToHtml("Responsibilities", position.responsibilities),
    listToHtml("Requirements", position.requirements),
    listToHtml("Nice to have", position.niceToHave),
    listToHtml("Benefits", position.benefits),
  ]
    .filter(Boolean)
    .join("")
}

export function createCareerOpeningMetadata(
  position: CareerOpenPosition
): Metadata {
  return createPageMetadata({
    title: `${position.title} (${position.type}) | Careers | ${brand.name}`,
    description: getCareerSeoDescription(position),
    path: `/careers/${position.id}`,
    keywords: getCareerSeoKeywords(position),
    ogImage: "/careers-hero.png",
    ogImageAlt: `${position.title} role at Techyx360 — open careers opportunity`,
  })
}

export function getCareerOpeningStructuredData(position: CareerOpenPosition) {
  return getJobPostingSchema({
    title: position.title,
    descriptionHtml: buildJobPostingDescriptionHtml(position),
    path: `/careers/${position.id}`,
    datePosted: position.postedAt,
    dateModified: position.updatedAt,
    employmentType: position.type,
    department: position.department,
    location: position.location,
    identifier: position.id,
    salaryMin: position.salaryMin,
    salaryMax: position.salaryMax,
  })
}

export function getCareersListingStructuredData(
  positions: CareerOpenPosition[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Careers at ${brand.name}`,
    description:
      "Explore open roles at Techyx360 and join a team building technology for Nigeria and Africa.",
    url: absoluteUrl("/careers"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: positions.length,
      itemListElement: positions.map((position, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/careers/${position.id}`),
        name: position.title,
        description: stripHtmlTags(position.description),
      })),
    },
  }
}
