import "server-only"

import sharp from "sharp"

/** Max width for on-page featured images. */
const FEATURED_MAX_WIDTH = 1600

/** WhatsApp / Open Graph preferred dimensions. */
const OG_WIDTH = 1200
const OG_HEIGHT = 630

/** Keep social previews under ~300KB. */
const FEATURED_QUALITY = 80
const OG_QUALITY = 72

export type OptimizedBlogImages = {
  featured: {
    buffer: Buffer
    contentType: "image/webp"
    extension: "webp"
  }
  og: {
    buffer: Buffer
    contentType: "image/webp"
    extension: "webp"
  }
}

/**
 * Converts uploads into lightweight WebP variants for page display and social previews.
 */
export async function optimizeBlogFeaturedImage(
  input: Buffer
): Promise<OptimizedBlogImages> {
  const image = sharp(input, { failOn: "none" }).rotate()

  const featuredBuffer = await image
    .clone()
    .resize({
      width: FEATURED_MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: FEATURED_QUALITY, effort: 4 })
    .toBuffer()

  const ogBuffer = await image
    .clone()
    .resize({
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fit: "cover",
      position: "attention",
    })
    .webp({ quality: OG_QUALITY, effort: 4 })
    .toBuffer()

  return {
    featured: {
      buffer: featuredBuffer,
      contentType: "image/webp",
      extension: "webp",
    },
    og: {
      buffer: ogBuffer,
      contentType: "image/webp",
      extension: "webp",
    },
  }
}
