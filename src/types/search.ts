export type SearchResultCategory =
  | "Page"
  | "Service"
  | "Training"
  | "Blog"

export type SearchResult = {
  id: string
  title: string
  description: string
  href: string
  category: SearchResultCategory
}

export type SearchResponse = {
  results: SearchResult[]
  query: string
}
