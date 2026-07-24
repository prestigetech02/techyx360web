"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Filter,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserRoundCheck,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  LEAD_SOURCES,
  formatYesNo,
  isSocialLeadSource,
  type LeadActivityType,
  type LeadActivityView,
  type LeadNoteView,
  type LeadStatus,
  type LeadView,
} from "@/lib/crm/lead-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const ACTIVITY_PREVIEW_COUNT = 2

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")

const filterTabs: Array<{ value: "all" | LeadStatus; label: string }> = [
  { value: "all", label: "All Leads" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
]

export type LeadAssigneeOption = {
  id: string
  fullName: string
  role: string
  department: string
  email: string
  initials: string
  accent: string
}

function formatIsoDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}

function yesNoValue(value: boolean | null | undefined) {
  if (value === true) return "yes"
  if (value === false) return "no"
  return ""
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-foreground">
        {children}
      </dd>
    </div>
  )
}

function statusClass(status: LeadStatus) {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
    case "contacted":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "qualified":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400"
    case "converted":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "lost":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? fallback
}

function AssigneeCombobox({
  id,
  value,
  onChange,
  options,
  disabled,
  placeholder = "Search team members...",
}: {
  id: string
  value: string
  onChange: (value: string) => void
  options: LeadAssigneeOption[]
  disabled?: boolean
  placeholder?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery(value)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [value])

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options

    return options.filter((option) =>
      [option.fullName, option.email, option.role, option.department].some(
        (field) => field.toLowerCase().includes(normalized)
      )
    )
  }, [options, query])

  const selected = useMemo(
    () =>
      options.find(
        (option) => option.fullName.toLowerCase() === value.trim().toLowerCase()
      ) ?? null,
    [options, value]
  )

  function selectOption(option: LeadAssigneeOption) {
    onChange(option.fullName)
    setQuery(option.fullName)
    setOpen(false)
  }

  function clearSelection() {
    onChange("")
    setQuery("")
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          value={query}
          disabled={disabled}
          autoComplete="off"
          placeholder={
            options.length === 0
              ? "No active team members available"
              : placeholder
          }
          className={cn(fieldClassName, "pl-9 pr-9")}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            if (value) onChange("")
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false)
              setQuery(value)
            }
            if (event.key === "Enter") {
              event.preventDefault()
              if (filteredOptions[0]) {
                selectOption(filteredOptions[0])
              }
            }
          }}
        />
        {value || query ? (
          <button
            type="button"
            className="absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={clearSelection}
            disabled={disabled}
            aria-label="Clear assignee"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {open && !disabled ? (
        <div className="absolute z-50 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg ring-1 ring-foreground/10">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              {options.length === 0
                ? "Add active team members first."
                : "No matching team members."}
            </p>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selected?.id === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted",
                    isSelected && "bg-brand/10"
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                      option.accent
                    )}
                  >
                    {option.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {option.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {option.role} · {option.department}
                    </p>
                  </div>
                  {isSelected ? (
                    <CheckCircle2
                      className="size-4 shrink-0 text-brand"
                      aria-hidden
                    />
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full sm:size-12",
            iconClass
          )}
        >
          <Icon className="size-5 sm:size-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <TrendingUp className="size-3 text-emerald-600" aria-hidden />
            <span className="font-semibold text-emerald-600">{change}</span>
            <span>vs last month</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function LeadActionsMenu({
  lead,
  onView,
  onMarkContacted,
  onQualify,
  onConvert,
  onViewClient,
  onMarkLost,
  onDelete,
}: {
  lead: LeadView
  onView: () => void
  onMarkContacted: () => void
  onQualify: () => void
  onConvert: () => void
  onViewClient: () => void
  onMarkLost: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        aria-label={`Open actions for ${lead.name}`}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <MoreVertical className="size-4" aria-hidden />
      </MenuPrimitive.Trigger>

      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50 outline-none"
        >
          <MenuPrimitive.Popup className="min-w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
            <MenuPrimitive.Item className={menuItemClassName} onClick={onView}>
              <Eye className="size-4" aria-hidden />
              View
            </MenuPrimitive.Item>

            {lead.status === "new" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkContacted}
              >
                <UserPlus className="size-4" aria-hidden />
                Mark as contacted
              </MenuPrimitive.Item>
            ) : null}

            {lead.status === "new" || lead.status === "contacted" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onQualify}
              >
                <Sparkles className="size-4" aria-hidden />
                Mark as qualified
              </MenuPrimitive.Item>
            ) : null}

            {lead.status !== "converted" && lead.status !== "lost" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onConvert}
              >
                <UserCheck className="size-4" aria-hidden />
                Convert lead
              </MenuPrimitive.Item>
            ) : null}

            {lead.clientId ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onViewClient}
              >
                <ExternalLink className="size-4" aria-hidden />
                View client
              </MenuPrimitive.Item>
            ) : null}

            {lead.status !== "lost" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkLost}
              >
                <Archive className="size-4" aria-hidden />
                Mark as lost
              </MenuPrimitive.Item>
            ) : null}

            <MenuPrimitive.Item
              className={cn(
                menuItemClassName,
                "text-destructive data-highlighted:bg-destructive/10"
              )}
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden />
              Delete lead
            </MenuPrimitive.Item>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
}) {
  const content = (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand/15">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </>
  )

  if (href) {
    return (
      <a href={href} className="group flex flex-col items-center gap-1.5">
        {content}
      </a>
    )
  }

  return (
    <button type="button" className="group flex flex-col items-center gap-1.5">
      {content}
    </button>
  )
}

function ActivityIcon({ type }: { type: LeadActivityType }) {
  if (type === "call") {
    return (
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
        <Phone className="size-4" aria-hidden />
      </span>
    )
  }
  if (type === "email") {
    return (
      <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
        <Mail className="size-4" aria-hidden />
      </span>
    )
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
      <MessageCircle className="size-4" aria-hidden />
    </span>
  )
}

function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  onConvert,
  onAddNote,
  onUpdate,
  assignees,
  isPending,
}: {
  lead: LeadView | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConvert: (id: string) => void
  onAddNote: (id: string, content: string) => Promise<void>
  onUpdate: (
    id: string,
    payload: Record<string, unknown>
  ) => Promise<LeadView | null>
  assignees: LeadAssigneeOption[]
  isPending: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="admin-ui w-full gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {lead ? (
          <LeadDetailContent
            key={lead.id}
            lead={lead}
            onConvert={onConvert}
            onAddNote={onAddNote}
            onUpdate={onUpdate}
            assignees={assignees}
            isPending={isPending}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function LeadDetailContent({
  lead,
  onConvert,
  onAddNote,
  onUpdate,
  assignees,
  isPending,
}: {
  lead: LeadView
  onConvert: (id: string) => void
  onAddNote: (id: string, content: string) => Promise<void>
  onUpdate: (
    id: string,
    payload: Record<string, unknown>
  ) => Promise<LeadView | null>
  assignees: LeadAssigneeOption[]
  isPending: boolean
}) {
  const [noteInput, setNoteInput] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [name, setName] = useState(lead.name)
  const [email, setEmail] = useState(lead.email)
  const [phone, setPhone] = useState(lead.phone)
  const [company, setCompany] = useState(lead.company)
  const [address, setAddress] = useState(lead.address)
  const [source, setSource] = useState(lead.source)
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [assignedTo, setAssignedTo] = useState(
    lead.assignedTo === "Unassigned" ? "" : lead.assignedTo
  )
  const [score, setScore] = useState(String(lead.score))
  const [followers, setFollowers] = useState(
    lead.followers == null ? "" : String(lead.followers)
  )
  const [nicheHashtag, setNicheHashtag] = useState(lead.nicheHashtag)
  const [gapFound, setGapFound] = useState(lead.gapFound)
  const [profileLink, setProfileLink] = useState(lead.profileLink)
  const [contactDate, setContactDate] = useState(lead.contactDate ?? "")
  const [opened, setOpened] = useState(yesNoValue(lead.opened))
  const [replied, setReplied] = useState(yesNoValue(lead.replied))
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ?? "")

  const notes: LeadNoteView[] = lead.notes ?? []
  const activities: LeadActivityView[] = lead.activities ?? []
  const previewActivities = activities.slice(0, ACTIVITY_PREVIEW_COUNT)
  const hasMoreActivities = activities.length > ACTIVITY_PREVIEW_COUNT
  const showFollowersField = isSocialLeadSource(source)

  function openEditDialog() {
    setName(lead.name)
    setEmail(lead.email)
    setPhone(lead.phone)
    setCompany(lead.company)
    setAddress(lead.address)
    setSource(lead.source)
    setStatus(lead.status)
    setAssignedTo(lead.assignedTo === "Unassigned" ? "" : lead.assignedTo)
    setScore(String(lead.score))
    setFollowers(lead.followers == null ? "" : String(lead.followers))
    setNicheHashtag(lead.nicheHashtag)
    setGapFound(lead.gapFound)
    setProfileLink(lead.profileLink)
    setContactDate(lead.contactDate ?? "")
    setOpened(yesNoValue(lead.opened))
    setReplied(yesNoValue(lead.replied))
    setFollowUpDate(lead.followUpDate ?? "")
    setEditOpen(true)
  }

  async function saveLead(event: FormEvent) {
    event.preventDefault()
    if (savingEdit) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedCompany = company.trim()
    const scoreValue = Number(score)

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedCompany) {
      notify.error("Name, email, phone, and company are required.")
      return
    }

    if (!Number.isFinite(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      notify.error("Lead score must be between 0 and 100.")
      return
    }

    const trimmedAssignee = assignedTo.trim()
    if (
      trimmedAssignee &&
      !assignees.some(
        (member) =>
          member.fullName.toLowerCase() === trimmedAssignee.toLowerCase()
      )
    ) {
      notify.error("Please select an assignee from the team directory.")
      return
    }

    setSavingEdit(true)
    try {
      const updated = await onUpdate(lead.id, {
        full_name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        company: trimmedCompany,
        address: address.trim(),
        source,
        status,
        assigned_to: assignedTo.trim() || null,
        score: Math.round(scoreValue),
        followers: showFollowersField ? followers.trim() || null : null,
        niche_hashtag: nicheHashtag.trim(),
        gap_found: gapFound.trim(),
        profile_link: profileLink.trim() || null,
        contact_date: contactDate || null,
        opened: opened || null,
        replied: replied || null,
        follow_up_date: followUpDate || null,
      })

      if (updated) {
        setEditOpen(false)
      }
    } finally {
      setSavingEdit(false)
    }
  }

  async function addNote() {
    const content = noteInput.trim()
    if (!content || savingNote) return

    setSavingNote(true)
    try {
      await onAddNote(lead.id, content)
      setNoteInput("")
      setShowNoteInput(false)
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <>
      <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 p-5 pr-12 text-left">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              lead.avatarClass
            )}
          >
            {lead.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-base font-bold text-foreground">
                {lead.name}
              </SheetTitle>
              <Badge
                className={cn("border-0 capitalize", statusClass(lead.status))}
              >
                {lead.status}
              </Badge>
            </div>
            <SheetDescription className="mt-1">
              <a href={`mailto:${lead.email}`} className="hover:underline">
                {lead.email}
              </a>
            </SheetDescription>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5 shrink-0 text-brand" aria-hidden />
              {lead.phone}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openEditDialog}
            className="h-9 shrink-0 gap-1.5 rounded-xl"
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <QuickAction
            icon={Phone}
            label="Call"
            href={`tel:${lead.phone.replace(/\s+/g, "")}`}
          />
          <QuickAction
            icon={Mail}
            label="Email"
            href={`mailto:${lead.email}`}
          />
          <QuickAction
            icon={MessageCircle}
            label="WhatsApp"
            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
          />
          <QuickAction icon={MoreHorizontal} label="More" />
        </div>
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain p-5">
        <section className="pb-5">
          <h3 className="text-sm font-bold text-foreground">Lead Details</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <DetailRow label="Company">{lead.company}</DetailRow>
            <DetailRow label="Address">
              {lead.address ? (
                <span className="inline-flex items-start justify-end gap-1.5">
                  <MapPin
                    className="mt-0.5 size-3.5 shrink-0 text-brand"
                    aria-hidden
                  />
                  <span>{lead.address}</span>
                </span>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Source">{lead.source}</DetailRow>
            {isSocialLeadSource(lead.source) ? (
              <DetailRow label="Followers">
                {lead.followers == null
                  ? "—"
                  : lead.followers.toLocaleString()}
              </DetailRow>
            ) : null}
            <DetailRow label="Niche / Hashtag">
              {lead.nicheHashtag || "—"}
            </DetailRow>
            <DetailRow label="Gap found">{lead.gapFound || "—"}</DetailRow>
            <DetailRow label="Profile link">
              {lead.profileLink ? (
                <a
                  href={
                    lead.profileLink.startsWith("http")
                      ? lead.profileLink
                      : `https://${lead.profileLink}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-brand hover:underline"
                >
                  {lead.profileLink}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="DM / Email / Call date">
              {formatIsoDate(lead.contactDate)}
            </DetailRow>
            <DetailRow label="Opened">{formatYesNo(lead.opened)}</DetailRow>
            <DetailRow label="Replied">{formatYesNo(lead.replied)}</DetailRow>
            <DetailRow label="Follow up date">
              {formatIsoDate(lead.followUpDate)}
            </DetailRow>
            <DetailRow label="Assigned To">{lead.assignedTo}</DetailRow>
            <DetailRow label="Lead Score">
              <span className="inline-flex items-center justify-end gap-1">
                {lead.score}
                <Star
                  className="size-3.5 fill-amber-400 text-amber-400"
                  aria-hidden
                />
              </span>
            </DetailRow>
            <DetailRow label="Created">{lead.created}</DetailRow>
          </dl>
        </section>

        <section className="border-t border-border/60 py-5">
          <h3 className="text-sm font-bold text-foreground">Notes</h3>
          <div className="mt-3 space-y-3">
            {notes.length > 0 ? (
              notes.map((note) => (
                <p
                  key={note.id}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {note.content}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
          </div>

          {showNoteInput ? (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <textarea
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
                placeholder="Write a note..."
                rows={3}
                className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={savingNote}
                  onClick={() => {
                    setShowNoteInput(false)
                    setNoteInput("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-brand text-brand-foreground hover:bg-brand/90"
                  disabled={!noteInput.trim() || savingNote}
                  onClick={() => {
                    void addNote()
                  }}
                >
                  {savingNote ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              <Plus className="size-4" aria-hidden />
              Add Note
            </button>
          )}
        </section>

        <section className="border-t border-border/60 pt-5">
          <h3 className="text-sm font-bold text-foreground">
            Activity Timeline
          </h3>
          {previewActivities.length > 0 ? (
            <ol className="mt-3 space-y-4">
              {previewActivities.map((activity) => (
                <li key={activity.id} className="flex gap-3">
                  <ActivityIcon type={activity.type} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.author}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          )}
          {hasMoreActivities ? (
            <button
              type="button"
              onClick={() => setActivitiesOpen(true)}
              className="mt-4 text-sm font-medium text-brand hover:underline"
            >
              View all activities ({activities.length})
            </button>
          ) : null}
        </section>
      </div>

      <div className="shrink-0 border-t border-border/60 p-4">
        {lead.clientId ? (
          <Button
            className="h-11 w-full gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
            render={<Link href={`/admin/clients?client=${lead.clientId}`} />}
          >
            <ExternalLink className="size-4" aria-hidden />
            View client
            <ChevronRight className="ml-auto size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            className="h-11 w-full gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={lead.status === "converted" || isPending}
            onClick={() => onConvert(lead.id)}
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Convert to Client
            <ChevronDown className="ml-auto size-4" aria-hidden />
          </Button>
        )}
      </div>

      <Dialog open={activitiesOpen} onOpenChange={setActivitiesOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>All activities</DialogTitle>
            <DialogDescription>
              Full activity history for {lead.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] space-y-4 overflow-y-auto overscroll-contain pr-1">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-3">
                {index < activities.length - 1 ? (
                  <span
                    className="absolute top-8 left-4 h-[calc(100%-0.5rem)] w-px bg-border"
                    aria-hidden
                  />
                ) : null}
                <ActivityIcon type={activity.type} />
                <div className="min-w-0 rounded-xl border border-border/60 bg-card px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.author}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setActivitiesOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit lead</DialogTitle>
            <DialogDescription>
              Update contact and company details for {lead.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void saveLead(event)}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="edit-lead-name" className={labelClassName}>
                  Full name
                </label>
                <Input
                  id="edit-lead-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClassName}
                  required
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label htmlFor="edit-lead-email" className={labelClassName}>
                  Email
                </label>
                <Input
                  id="edit-lead-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldClassName}
                  required
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label htmlFor="edit-lead-phone" className={labelClassName}>
                  Phone
                </label>
                <Input
                  id="edit-lead-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={fieldClassName}
                  required
                  disabled={savingEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edit-lead-company" className={labelClassName}>
                  Company
                </label>
                <Input
                  id="edit-lead-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className={fieldClassName}
                  required
                  disabled={savingEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edit-lead-address" className={labelClassName}>
                  Address
                </label>
                <Input
                  id="edit-lead-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="City, state, country"
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label htmlFor="edit-lead-source" className={labelClassName}>
                  Source
                </label>
                <select
                  id="edit-lead-source"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className={selectClassName}
                  disabled={savingEdit}
                >
                  {LEAD_SOURCES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {showFollowersField ? (
                <div>
                  <label
                    htmlFor="edit-lead-followers"
                    className={labelClassName}
                  >
                    Followers
                  </label>
                  <Input
                    id="edit-lead-followers"
                    type="number"
                    min={0}
                    value={followers}
                    onChange={(event) => setFollowers(event.target.value)}
                    placeholder="e.g. 12500"
                    className={fieldClassName}
                    disabled={savingEdit}
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor="edit-lead-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="edit-lead-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as LeadStatus)
                  }
                  className={selectClassName}
                  disabled={savingEdit}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-lead-assigned" className={labelClassName}>
                  Assigned to
                </label>
                <AssigneeCombobox
                  id="edit-lead-assigned"
                  value={assignedTo}
                  onChange={setAssignedTo}
                  options={assignees}
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label htmlFor="edit-lead-score" className={labelClassName}>
                  Lead score (0–100)
                </label>
                <Input
                  id="edit-lead-score"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-lead-niche"
                  className={labelClassName}
                >
                  Niche / Hashtag
                </label>
                <Input
                  id="edit-lead-niche"
                  value={nicheHashtag}
                  onChange={(event) => setNicheHashtag(event.target.value)}
                  placeholder="e.g. edtech, #fintech"
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edit-lead-gap" className={labelClassName}>
                  Gap found
                </label>
                <Input
                  id="edit-lead-gap"
                  value={gapFound}
                  onChange={(event) => setGapFound(event.target.value)}
                  placeholder="What opportunity or gap did you notice?"
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-lead-profile"
                  className={labelClassName}
                >
                  Profile link
                </label>
                <Input
                  id="edit-lead-profile"
                  value={profileLink}
                  onChange={(event) => setProfileLink(event.target.value)}
                  placeholder="https://..."
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-lead-contact-date"
                  className={labelClassName}
                >
                  DM / Email / Call date
                </label>
                <Input
                  id="edit-lead-contact-date"
                  type="date"
                  value={contactDate}
                  onChange={(event) => setContactDate(event.target.value)}
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-lead-follow-up"
                  className={labelClassName}
                >
                  Follow up date
                </label>
                <Input
                  id="edit-lead-follow-up"
                  type="date"
                  value={followUpDate}
                  onChange={(event) => setFollowUpDate(event.target.value)}
                  className={fieldClassName}
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label htmlFor="edit-lead-opened" className={labelClassName}>
                  Opened
                </label>
                <select
                  id="edit-lead-opened"
                  value={opened}
                  onChange={(event) => setOpened(event.target.value)}
                  className={selectClassName}
                  disabled={savingEdit}
                >
                  <option value="">Not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-lead-replied" className={labelClassName}>
                  Replied
                </label>
                <select
                  id="edit-lead-replied"
                  value={replied}
                  onChange={(event) => setReplied(event.target.value)}
                  className={selectClassName}
                  disabled={savingEdit}
                >
                  <option value="">Not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={savingEdit}
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={savingEdit}
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

type LeadsDashboardProps = {
  leads: LeadView[]
  assignees?: LeadAssigneeOption[]
}

export function LeadsDashboard({
  leads,
  assignees = [],
}: LeadsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<"all" | LeadStatus>("all")
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterSource, setFilterSource] = useState("")
  const [filterAssignedTo, setFilterAssignedTo] = useState("")
  const [filterMinScore, setFilterMinScore] = useState("")
  const [draftSource, setDraftSource] = useState("")
  const [draftAssignedTo, setDraftAssignedTo] = useState("")
  const [draftMinScore, setDraftMinScore] = useState("")
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeadView | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [address, setAddress] = useState("")
  const [source, setSource] = useState("Website Form")
  const [status, setStatus] = useState<LeadStatus>("new")
  const [assignedTo, setAssignedTo] = useState("")
  const [score, setScore] = useState("50")
  const [followers, setFollowers] = useState("")
  const [nicheHashtag, setNicheHashtag] = useState("")
  const [gapFound, setGapFound] = useState("")
  const [profileLink, setProfileLink] = useState("")
  const [contactDate, setContactDate] = useState("")
  const [opened, setOpened] = useState("")
  const [replied, setReplied] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [note, setNote] = useState("")

  const showFollowersField = isSocialLeadSource(source)

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  )

  useEffect(() => {
    if (selectedLeadId && !leads.some((lead) => lead.id === selectedLeadId)) {
      setSelectedLeadId(null)
    }
  }, [leads, selectedLeadId])

  const statusCounts = useMemo(
    () => ({
      all: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      qualified: leads.filter((lead) => lead.status === "qualified").length,
      converted: leads.filter((lead) => lead.status === "converted").length,
      lost: leads.filter((lead) => lead.status === "lost").length,
    }),
    [leads]
  )

  const assigneeOptions = useMemo(() => {
    const values = new Set<string>()
    for (const member of assignees) {
      values.add(member.fullName)
    }
    for (const lead of leads) {
      const assignee = lead.assignedTo.trim()
      if (assignee && assignee !== "Unassigned") values.add(assignee)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [assignees, leads])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterSource) count += 1
    if (filterAssignedTo) count += 1
    if (filterMinScore.trim()) count += 1
    return count
  }, [filterAssignedTo, filterMinScore, filterSource])

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const minScore = filterMinScore.trim()
      ? Number(filterMinScore)
      : null

    return leads.filter((lead) => {
      const matchesStatus = activeTab === "all" || lead.status === activeTab
      const matchesSearch =
        !normalizedQuery ||
        [
          lead.name,
          lead.email,
          lead.company,
          lead.address,
          lead.source,
          lead.phone,
          lead.assignedTo,
          lead.nicheHashtag,
          lead.gapFound,
          lead.profileLink,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      const matchesSource = !filterSource || lead.source === filterSource
      const matchesAssignee =
        !filterAssignedTo || lead.assignedTo === filterAssignedTo
      const matchesScore =
        minScore == null ||
        !Number.isFinite(minScore) ||
        lead.score >= minScore

      return (
        matchesStatus &&
        matchesSearch &&
        matchesSource &&
        matchesAssignee &&
        matchesScore
      )
    })
  }, [
    activeTab,
    filterAssignedTo,
    filterMinScore,
    filterSource,
    leads,
    query,
  ])

  function openFiltersDialog() {
    setDraftSource(filterSource)
    setDraftAssignedTo(filterAssignedTo)
    setDraftMinScore(filterMinScore)
    setFiltersOpen(true)
  }

  function applyFilters() {
    setFilterSource(draftSource)
    setFilterAssignedTo(draftAssignedTo)
    setFilterMinScore(draftMinScore.trim())
    setFiltersOpen(false)
  }

  function clearFilters() {
    setFilterSource("")
    setFilterAssignedTo("")
    setFilterMinScore("")
    setDraftSource("")
    setDraftAssignedTo("")
    setDraftMinScore("")
    setFiltersOpen(false)
  }

  function refreshLeads() {
    startTransition(() => {
      router.refresh()
    })
  }

  function resetAddForm() {
    setName("")
    setEmail("")
    setPhone("")
    setCompany("")
    setAddress("")
    setSource("Website Form")
    setStatus("new")
    setAssignedTo("")
    setScore("50")
    setFollowers("")
    setNicheHashtag("")
    setGapFound("")
    setProfileLink("")
    setContactDate("")
    setOpened("")
    setReplied("")
    setFollowUpDate("")
    setNote("")
  }

  async function handleAddLead(event: FormEvent) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedCompany = company.trim()
    const scoreValue = Number(score)

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedCompany) {
      notify.error("Name, email, phone, and company are required.")
      return
    }

    if (!Number.isFinite(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      notify.error("Lead score must be between 0 and 100.")
      return
    }

    const trimmedAssignee = assignedTo.trim()
    if (
      trimmedAssignee &&
      !assignees.some(
        (member) =>
          member.fullName.toLowerCase() === trimmedAssignee.toLowerCase()
      )
    ) {
      notify.error("Please select an assignee from the team directory.")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          company: trimmedCompany,
          address: address.trim(),
          source,
          status,
          assigned_to: assignedTo.trim() || null,
          score: Math.round(scoreValue),
          followers: showFollowersField ? followers.trim() || null : null,
          niche_hashtag: nicheHashtag.trim(),
          gap_found: gapFound.trim(),
          profile_link: profileLink.trim() || null,
          contact_date: contactDate || null,
          opened: opened || null,
          replied: replied || null,
          follow_up_date: followUpDate || null,
          note: note.trim() || null,
        }),
      })

      if (!response.ok) {
        notify.error(await readErrorMessage(response, "Unable to create lead."))
        return
      }

      const data = (await response.json()) as { lead?: LeadView }
      setAddDialogOpen(false)
      resetAddForm()
      if (data.lead?.id) {
        setSelectedLeadId(data.lead.id)
      }
      notify.success("Lead added.")
      refreshLeads()
    } finally {
      setCreating(false)
    }
  }

  async function updateLeadStatus(id: string, nextStatus: LeadStatus) {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to update lead."))
      return
    }

    const message =
      nextStatus === "contacted"
        ? "Lead marked as contacted."
        : nextStatus === "qualified"
          ? "Lead marked as qualified."
          : nextStatus === "lost"
            ? "Lead marked as lost."
            : "Lead status updated."

    notify.success(message)
    refreshLeads()
  }

  async function updateLead(
    id: string,
    payload: Record<string, unknown>
  ): Promise<LeadView | null> {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to update lead."))
      return null
    }

    const data = (await response.json()) as { lead?: LeadView }
    notify.success("Lead updated.")
    refreshLeads()
    return data.lead ?? null
  }

  async function convertLead(id: string) {
    const response = await fetch(`/api/admin/leads/${id}/convert`, {
      method: "POST",
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to convert lead."))
      return
    }

    const data = (await response.json().catch(() => null)) as {
      client?: { id?: string }
    } | null

    notify.success("Lead converted to client.")
    refreshLeads()

    if (data?.client?.id) {
      router.push(`/admin/clients?client=${data.client.id}`)
    }
  }

  async function deleteLead(id: string) {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to delete lead."))
      return
    }

    setDeleteTarget(null)
    if (selectedLeadId === id) setSelectedLeadId(null)
    notify.success("Lead deleted.")
    refreshLeads()
  }

  async function addNote(id: string, content: string) {
    const response = await fetch(`/api/admin/leads/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to add note."))
      return
    }

    notify.success("Note added.")
    refreshLeads()
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>CRM</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Leads</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track your potential customers.
          </p>
        </div>

        <Button
          type="button"
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Add lead
        </Button>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="grid min-w-0 grid-cols-4 gap-3">
          <StatCard
            label="Total Leads"
            value={String(statusCounts.all)}
            change="—"
            icon={Target}
            iconClass="bg-blue-500/10 text-blue-600"
          />
          <StatCard
            label="New Leads"
            value={String(statusCounts.new)}
            change="—"
            icon={UserPlus}
            iconClass="bg-sky-500/10 text-sky-600"
          />
          <StatCard
            label="Qualified Leads"
            value={String(statusCounts.qualified)}
            change="—"
            icon={Sparkles}
            iconClass="bg-violet-500/10 text-violet-600"
          />
          <StatCard
            label="Converted Leads"
            value={String(statusCounts.converted)}
            change="—"
            icon={UserRoundCheck}
            iconClass="bg-emerald-500/10 text-emerald-600"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/60 px-4 pt-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-1 overflow-x-auto">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:text-sm",
                    activeTab === tab.value
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label} ({statusCounts[tab.value]})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pb-3 lg:pl-4">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-10 rounded-xl px-3 text-muted-foreground",
                  activeFilterCount > 0 && "border-brand text-brand"
                )}
                onClick={openFiltersDialog}
              >
                <Filter className="size-4" aria-hidden />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge className="ml-1 border-0 bg-brand/10 text-brand">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
              <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search leads..."
                  className="h-10 rounded-xl pl-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3">Lead</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedLeadId(lead.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedLeadId(lead.id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/25"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            lead.avatarClass
                          )}
                        >
                          {lead.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {lead.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lead.company}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lead.source}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={cn(
                          "border-0 capitalize",
                          statusClass(lead.status)
                        )}
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div onClick={(event) => event.stopPropagation()}>
                        <LeadActionsMenu
                          lead={lead}
                          onView={() => setSelectedLeadId(lead.id)}
                          onMarkContacted={() => {
                            void updateLeadStatus(lead.id, "contacted")
                          }}
                          onQualify={() => {
                            void updateLeadStatus(lead.id, "qualified")
                          }}
                          onConvert={() => {
                            void convertLead(lead.id)
                          }}
                          onViewClient={() => {
                            if (lead.clientId) {
                              router.push(
                                `/admin/clients?client=${lead.clientId}`
                              )
                            }
                          }}
                          onMarkLost={() => {
                            void updateLeadStatus(lead.id, "lost")
                          }}
                          onDelete={() => setDeleteTarget(lead)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Search className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 font-medium text-foreground">No leads found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {leads.length === 0
                  ? "Add your first lead to get started."
                  : "Try another search term or status."}
              </p>
            </div>
          ) : null}

          <div className="border-t border-border/60 px-5 py-4 text-xs text-muted-foreground">
            <p>
              Showing {filteredLeads.length} matching lead
              {filteredLeads.length === 1 ? "" : "s"}
              {activeFilterCount > 0 || query.trim()
                ? " with current search/filters"
                : ""}
            </p>
          </div>
        </section>
      </div>

      <LeadDetailSheet
        lead={selectedLead}
        open={selectedLead != null}
        onOpenChange={(open) => {
          if (!open) setSelectedLeadId(null)
        }}
        onConvert={(id) => {
          void convertLead(id)
        }}
        onAddNote={addNote}
        onUpdate={updateLead}
        assignees={assignees}
        isPending={isPending}
      />

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter leads</DialogTitle>
            <DialogDescription>
              Narrow the list by source, assignee, or minimum score.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="lead-filter-source" className={labelClassName}>
                Source
              </label>
              <select
                id="lead-filter-source"
                value={draftSource}
                onChange={(event) => setDraftSource(event.target.value)}
                className={selectClassName}
              >
                <option value="">All sources</option>
                {LEAD_SOURCES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-filter-assignee" className={labelClassName}>
                Assigned to
              </label>
              <select
                id="lead-filter-assignee"
                value={draftAssignedTo}
                onChange={(event) => setDraftAssignedTo(event.target.value)}
                className={selectClassName}
              >
                <option value="">Anyone</option>
                {assigneeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-filter-score" className={labelClassName}>
                Minimum score
              </label>
              <Input
                id="lead-filter-score"
                type="number"
                min={0}
                max={100}
                value={draftMinScore}
                onChange={(event) => setDraftMinScore(event.target.value)}
                placeholder="e.g. 50"
                className={fieldClassName}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={clearFilters}
            >
              Clear all
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setFiltersOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={applyFilters}
              >
                Apply filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.name}” will be removed permanently. This cannot be undone.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={!deleteTarget || isPending}
              onClick={() => {
                if (deleteTarget) void deleteLead(deleteTarget.id)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add lead</DialogTitle>
            <DialogDescription>
              Capture a new prospect and track them through your pipeline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLead} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="lead-name" className={labelClassName}>
                  Full name
                </label>
                <Input
                  id="lead-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Olufemi Adeyemi"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="lead-email" className={labelClassName}>
                  Email
                </label>
                <Input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="lead-phone" className={labelClassName}>
                  Phone
                </label>
                <Input
                  id="lead-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+234 803 123 4567"
                  className={fieldClassName}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-company" className={labelClassName}>
                  Company
                </label>
                <Input
                  id="lead-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. Edwot School Management"
                  className={fieldClassName}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-address" className={labelClassName}>
                  Address
                </label>
                <Input
                  id="lead-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="City, state, country"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="lead-source" className={labelClassName}>
                  Source
                </label>
                <select
                  id="lead-source"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className={selectClassName}
                >
                  {LEAD_SOURCES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {showFollowersField ? (
                <div>
                  <label htmlFor="lead-followers" className={labelClassName}>
                    Followers
                  </label>
                  <Input
                    id="lead-followers"
                    type="number"
                    min={0}
                    value={followers}
                    onChange={(event) => setFollowers(event.target.value)}
                    placeholder="e.g. 12500"
                    className={fieldClassName}
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor="lead-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="lead-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as LeadStatus)
                  }
                  className={selectClassName}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label htmlFor="lead-assigned" className={labelClassName}>
                  Assigned to
                </label>
                <AssigneeCombobox
                  id="lead-assigned"
                  value={assignedTo}
                  onChange={setAssignedTo}
                  options={assignees}
                  disabled={creating}
                />
              </div>
              <div>
                <label htmlFor="lead-score" className={labelClassName}>
                  Lead score (0–100)
                </label>
                <Input
                  id="lead-score"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-niche" className={labelClassName}>
                  Niche / Hashtag
                </label>
                <Input
                  id="lead-niche"
                  value={nicheHashtag}
                  onChange={(event) => setNicheHashtag(event.target.value)}
                  placeholder="e.g. edtech, #fintech"
                  className={fieldClassName}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-gap" className={labelClassName}>
                  Gap found
                </label>
                <Input
                  id="lead-gap"
                  value={gapFound}
                  onChange={(event) => setGapFound(event.target.value)}
                  placeholder="What opportunity or gap did you notice?"
                  className={fieldClassName}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-profile" className={labelClassName}>
                  Profile link
                </label>
                <Input
                  id="lead-profile"
                  value={profileLink}
                  onChange={(event) => setProfileLink(event.target.value)}
                  placeholder="https://..."
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="lead-contact-date" className={labelClassName}>
                  DM / Email / Call date
                </label>
                <Input
                  id="lead-contact-date"
                  type="date"
                  value={contactDate}
                  onChange={(event) => setContactDate(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="lead-follow-up" className={labelClassName}>
                  Follow up date
                </label>
                <Input
                  id="lead-follow-up"
                  type="date"
                  value={followUpDate}
                  onChange={(event) => setFollowUpDate(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="lead-opened" className={labelClassName}>
                  Opened
                </label>
                <select
                  id="lead-opened"
                  value={opened}
                  onChange={(event) => setOpened(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">Not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label htmlFor="lead-replied" className={labelClassName}>
                  Replied
                </label>
                <select
                  id="lead-replied"
                  value={replied}
                  onChange={(event) => setReplied(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">Not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lead-note" className={labelClassName}>
                  Initial note
                </label>
                <textarea
                  id="lead-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional context about this lead..."
                  rows={3}
                  className={cn(
                    fieldClassName,
                    "h-auto min-h-[88px] resize-y py-2.5"
                  )}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={creating}
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
