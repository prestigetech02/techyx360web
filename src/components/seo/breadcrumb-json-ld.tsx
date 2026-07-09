import { JsonLd } from "@/components/seo/json-ld"
import {
  getBreadcrumbSchema,
  type BreadcrumbItem,
} from "@/lib/structured-data"

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLd data={getBreadcrumbSchema(items)} />
}
