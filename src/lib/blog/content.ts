export function stripHtmlTags(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

export function isRichTextEmpty(content: string) {
  return stripHtmlTags(content).length === 0
}

export function isHtmlContent(content: string) {
  const trimmed = content.trim()
  if (!trimmed) return false

  return (
    trimmed.startsWith("<") ||
    /<(p|h[1-6]|ul|ol|li|blockquote|strong|em|a|div|br)\b/i.test(trimmed)
  )
}
