import type { Metadata } from "next"

import { siteUrl, socialShareImage } from "@/config/site"

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
  type?: "website" | "article"
}

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, siteUrl).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage = socialShareImage,
  noIndex = false,
  type = "website",
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type,
      locale: "en_NG",
      siteName: "Techyx360",
      images: [
        {
          url: imageUrl,
          alt: imageUrl.includes("techyx360.png") ? "Techyx360" : title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
