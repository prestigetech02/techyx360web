import { organization, siteUrl } from "@/config/site"
import { services } from "@/config/services"
import { absoluteUrl } from "@/lib/seo"

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
