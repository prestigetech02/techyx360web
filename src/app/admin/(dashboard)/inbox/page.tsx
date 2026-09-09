import { InboxDashboard } from "@/components/admin/inbox-dashboard"
import { brand } from "@/config/brand"

export const metadata = {
  title: `Inbox | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminInboxPageProps = {
  searchParams?: Promise<{ c?: string }>
}

export default async function AdminInboxPage({
  searchParams,
}: AdminInboxPageProps) {
  const params = (await searchParams) ?? {}
  const initialConversationId =
    typeof params.c === "string" && params.c.trim() ? params.c.trim() : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="shrink-0">
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Live chat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read website chats, take over from the assistant, and reply in the
          same thread.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <InboxDashboard initialConversationId={initialConversationId} />
      </div>
    </div>
  )
}
