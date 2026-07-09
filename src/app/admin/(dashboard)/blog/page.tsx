import { brand } from "@/config/brand"

export const metadata = {
  title: `Blog | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminBlogPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
          Blog
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Create, edit, and publish blog posts for the Techyx360 website.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Blog management will appear here once connected to Supabase.
        </p>
      </div>
    </div>
  )
}
