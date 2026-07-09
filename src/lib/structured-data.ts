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
