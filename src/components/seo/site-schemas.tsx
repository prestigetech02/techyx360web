import { JsonLd } from "@/components/seo/json-ld"
import { getSiteStructuredData } from "@/lib/structured-data"

export function SiteSchemas() {
  return <JsonLd data={getSiteStructuredData()} />
}
