import { brand } from "@/config/brand"

export const metadata = {
  title: `Settings | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminSettingsPage() {
  return (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Configure admin preferences, notifications, and account options.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Admin settings will appear here soon.
        </p>
      </div>
    </div>
  )
}
