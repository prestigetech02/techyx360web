import { organization, siteUrl } from "@/config/site"
import { services } from "@/config/services"
import { absoluteUrl } from "@/lib/seo"

export type BreadcrumbItem = {
  name: string
  path: string
}

export type FaqItem = {
  question: string
  answer: string
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organization.id,
    name: organization.name,
    alternateName: organization.alternateName,
    url: organization.url,
    logo: organization.logo,
    email: organization.email,
    telephone: organization.phone,
    foundingDate: organization.foundingDate,
    sameAs: organization.sameAs,
    address: {
      "@type": "PostalAddress",
      streetAddress: organization.address.streetAddress,
      addressLocality: organization.address.addressLocality,
      addressRegion: organization.address.addressRegion,
      addressCountry: organization.address.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: organization.phone,
        email: organization.email,
        contactType: "customer service",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
    ],
  }
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: organization.alternateName,
    publisher: {
      "@id": organization.id,
    },
    inLanguage: "en-NG",
  }
}

export function getServicesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/#services`,
    name: "Techyx360 Services",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        url: absoluteUrl(service.href),
        provider: {
          "@id": organization.id,
        },
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
        },
      },
    })),
  }
}

export function getSiteStructuredData() {
  return [getOrganizationSchema(), getWebsiteSchema(), getServicesSchema()]
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function getFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

type CourseSchemaOptions = {
  name: string
  description: string
  path: string
  image: string
  duration?: string
  teaches?: string[]
}

export function getCourseSchema({
  name,
  description,
  path,
  image,
  duration,
  teaches,
}: CourseSchemaOptions) {
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image)

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: absoluteUrl(path),
    image: imageUrl,
    provider: {
      "@id": organization.id,
    },
    inLanguage: "en-NG",
    ...(duration ? { timeRequired: duration } : {}),
    ...(teaches?.length ? { teaches } : {}),
  }
}

type JobPostingSchemaOptions = {
  title: string
  descriptionHtml: string
  path: string
  datePosted: string
  dateModified?: string
  employmentType: string
  department: string
  location: string
  identifier: string
  salaryMin?: number | null
  salaryMax?: number | null
}

function mapEmploymentType(type: string) {
  const normalized = type.trim().toLowerCase().replace(/[\s_]+/g, "-")

  if (normalized === "full-time" || normalized === "fulltime") return "FULL_TIME"
  if (normalized === "part-time" || normalized === "parttime") return "PART_TIME"
  if (normalized === "contract" || normalized === "contractor") {
    return "CONTRACTOR"
  }

  return "OTHER"
}

function parseJobLocation(location: string) {
  const isRemote = /remote/i.test(location)
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  const addressLocality = isRemote
    ? organization.address.addressLocality
    : (parts[0] ?? organization.address.addressLocality)
  const addressRegion = isRemote
    ? organization.address.addressRegion
    : (parts.find((part) => /lagos|abuja|rivers|ogun|oyo/i.test(part)) ??
      parts[1] ??
      organization.address.addressRegion)

  return {
    isRemote,
    address: {
      "@type": "PostalAddress",
      addressLocality,
      addressRegion,
      addressCountry: "NG",
      ...(isRemote
        ? {}
        : {
            streetAddress: organization.address.streetAddress,
          }),
    },
  }
}

export function getJobPostingSchema({
  title,
  descriptionHtml,
  path,
  datePosted,
  dateModified,
  employmentType,
  department,
  location,
  identifier,
  salaryMin,
  salaryMax,
}: JobPostingSchemaOptions) {
  const pageUrl = absoluteUrl(path)
  const postedDate = new Date(datePosted)
  const validThrough = new Date(postedDate)
  validThrough.setDate(validThrough.getDate() + 90)

  const { isRemote, address } = parseJobLocation(location)

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: descriptionHtml,
    datePosted: postedDate.toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: mapEmploymentType(employmentType),
    hiringOrganization: {
      "@id": organization.id,
      "@type": "Organization",
      name: organization.name,
      sameAs: organization.url,
      logo: organization.logo,
    },
    identifier: {
      "@type": "PropertyValue",
      name: organization.name,
      value: identifier,
    },
    industry: "Information Technology",
    occupationalCategory: department,
    url: pageUrl,
    directApply: true,
    ...(dateModified
      ? { dateModified: new Date(dateModified).toISOString() }
      : {}),
  }

  if (isRemote) {
    schema.jobLocationType = "TELECOMMUTE"
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "Nigeria",
    }
  }

  schema.jobLocation = {
    "@type": "Place",
    address,
  }

  if (salaryMin != null || salaryMax != null) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "NGN",
      value: {
        "@type": "QuantitativeValue",
        ...(salaryMin != null ? { minValue: salaryMin } : {}),
        ...(salaryMax != null ? { maxValue: salaryMax } : {}),
        ...(salaryMin != null && salaryMax == null
          ? { value: salaryMin }
          : {}),
        ...(salaryMax != null && salaryMin == null
          ? { value: salaryMax }
          : {}),
        unitText: "MONTH",
      },
    }
  }

  return schema
}

type ArticleSchemaOptions = {
  title: string
  description: string
  path: string
  image: string
  datePublished: string
  dateModified?: string
  author: string
  tags: string[]
  wordCount?: number
}

export function getArticleSchema({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
  author,
  tags,
  wordCount,
}: ArticleSchemaOptions) {
  const pageUrl = absoluteUrl(path)
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Organization",
      name: author,
      "@id": organization.id,
    },
    publisher: {
      "@id": organization.id,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    url: pageUrl,
    keywords: tags.join(", "),
    ...(tags[0] ? { articleSection: tags[0] } : {}),
    ...(wordCount ? { wordCount } : {}),
  }
}
