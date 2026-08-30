import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, "..", "public")
const fs = await import("node:fs/promises")

const heroAssets = [
  {
    input: "corp.hero.svg",
    output: "corp.hero.webp",
    width: 1200,
    fallbackUrl:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
  },
  {
    input: "bootcamp-hero.svg",
    output: "bootcamp-hero.webp",
    width: 1200,
  },
  {
    input: "hero2.svg",
    output: "hero2.webp",
    width: 1200,
  },
]

const photoAssets = [
  { input: "careers-hero.png", output: "careers-hero.webp", width: 1600, quality: 72 },
  { input: "vahero.png", output: "vahero.webp", width: 1200, quality: 72 },
  { input: "pil.png", output: "pil.webp", width: 1600, quality: 70 },
  { input: "pil2.png", output: "pil2.webp", width: 1400, quality: 70 },
  {
    input: "77033d0b-9ed4-49d8-86fe-1fdc7865e835.png",
    output: "siwes-hero.webp",
    width: 1200,
    quality: 72,
  },
  { input: "hero-arrow.png", output: "hero-arrow.webp", width: 680, quality: 80 },
]

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function writeWebp(pipeline, outputPath, width, quality = 82) {
  await pipeline
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outputPath)

  const stats = await sharp(outputPath).metadata()
  const { size } = await fs.stat(outputPath)

  console.log(
    `  ${path.basename(outputPath)}: ${Math.round(size / 1024)} KB (${stats.width}x${stats.height})`
  )
}

async function optimizeFromFile(inputPath, outputPath, width, quality = 82) {
  const isSvg = inputPath.endsWith(".svg")
  const pipeline = isSvg
    ? sharp(inputPath, { density: 150 })
    : sharp(inputPath)

  await writeWebp(pipeline, outputPath, width, quality)
}

async function optimizeFromUrl(url, outputPath, width) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  await writeWebp(sharp(buffer), outputPath, width)
}

const force = process.env.FORCE_HERO_IMAGES === "1"

for (const asset of [...heroAssets, ...photoAssets]) {
  const inputPath = path.join(publicDir, asset.input)
  const outputPath = path.join(publicDir, asset.output)
  const hasOutput = await fileExists(outputPath)
  const hasInput = await fileExists(inputPath)

  if (hasOutput && !force) {
    console.log(`Skipping ${asset.output} — already exists`)
    continue
  }

  console.log(`Optimizing ${asset.input} -> ${asset.output}`)

  try {
    if (hasInput) {
      await optimizeFromFile(inputPath, outputPath, asset.width, asset.quality)
      continue
    }

    if (asset.fallbackUrl) {
      console.log(`  Input missing, using fallback source for ${asset.output}`)
      await optimizeFromUrl(asset.fallbackUrl, outputPath, asset.width)
      continue
    }

    throw new Error(`Input file is missing: ${inputPath}`)
  } catch (error) {
    if (hasOutput) {
      console.warn(`  Failed to optimize ${asset.input}, keeping existing ${asset.output}`)
      continue
    }

    if (asset.fallbackUrl) {
      console.log(`  Retrying ${asset.output} from fallback source...`)
      try {
        await optimizeFromUrl(asset.fallbackUrl, outputPath, asset.width)
        continue
      } catch (fallbackError) {
        console.error(`  Fallback failed for ${asset.output}:`, fallbackError.message)
      }
    }

    console.error(`  Failed to optimize ${asset.input}:`, error.message)
  }
}

console.log("Hero image optimization complete.")
