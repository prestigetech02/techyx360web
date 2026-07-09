import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, "..", "public")

const heroAssets = [
  {
    input: "corp.hero.svg",
    output: "corp.hero.webp",
    width: 1200,
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

for (const asset of heroAssets) {
  const inputPath = path.join(publicDir, asset.input)
  const outputPath = path.join(publicDir, asset.output)

  console.log(`Optimizing ${asset.input} -> ${asset.output}`)

  try {
    await sharp(inputPath, { density: 150 })
      .resize(asset.width, asset.width, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath)

    const stats = await sharp(outputPath).metadata()
    const fs = await import("node:fs/promises")
    const { size } = await fs.stat(outputPath)

    console.log(
      `  ${asset.output}: ${Math.round(size / 1024)} KB (${stats.width}x${stats.height})`
    )
  } catch (error) {
    console.error(`  Failed to optimize ${asset.input}:`, error.message)
  }
}

console.log("Hero image optimization complete.")

const corpOutput = path.join(publicDir, "corp.hero.webp")
const fs = await import("node:fs/promises")

try {
  await fs.access(corpOutput)
} catch {
  const corpFallbackUrl =
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"

  console.log("Generating corp.hero.webp from fallback source...")

  const response = await fetch(corpFallbackUrl)
  const buffer = Buffer.from(await response.arrayBuffer())

  await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(corpOutput)

  const { size } = await fs.stat(corpOutput)
  console.log(`  corp.hero.webp: ${Math.round(size / 1024)} KB`)
}
