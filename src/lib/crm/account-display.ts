export const accentPalette = [
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-rose-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-cyan-600 text-white",
  "bg-indigo-600 text-white",
] as const

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
}

export function accentForIndex(index: number) {
  return accentPalette[index % accentPalette.length]
}
