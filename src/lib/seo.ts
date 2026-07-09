import type { Metadata } from "next"

import { pageOgImages } from "@/config/og-images"
import { siteUrl, socialShareImage } from "@/config/site"

type ArticleMetadata = {
  publishedTime: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
}

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
  ogImageAlt?: string
  ogImageWidth?: number
  ogImageHeight?: number
  noIndex?: boolean
  type?: "website" | "article"
  article?: ArticleMetadata
}

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, siteUrl).toString()
}

function resolveOgImage(path: string, ogImage?: string) {
  if (ogImage) {
    return {
      url: ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage),
      alt: undefined as string | undefined,
      width: undefined as number | undefined,
      height: undefined as number | undefined,
    }
  }

  const configured = pageOgImages[path]
  if (configured) {
    return {
      url: configured.url.startsWith("http")
        ? configured.url
        : absoluteUrl(configured.url),
      alt: configured.alt,
      width: configured.width,
      height: configured.height,
    }
  }

  return {
    url: absoluteUrl(socialShareImage),
    alt: "Techyx360",
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  }
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage,
  ogImageAlt,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  noIndex = false,
  type = "website",
  article,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path)
  const resolved = resolveOgImage(path, ogImage)
  const imageAlt = ogImageAlt ?? resolved.alt ?? title

  const openGraph: Metadata["openGraph"] = {
    title,
    description,
    url: canonical,
    type,
    locale: "en_NG",
    siteName: "Techyx360",
    images: [
      {
        url: resolved.url,
        alt: imageAlt,
        width: resolved.width ?? ogImageWidth,
        height: resolved.height ?? ogImageHeight,
      },
    ],
    ...(type === "article" && article
      ? {
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime ?? article.publishedTime,
          authors: article.authors,
          tags: article.tags,
        }
      : {}),
  }

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolved.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
