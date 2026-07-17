"use client"

import { useMemo, useState, type ComponentType, type FormEvent } from "react"
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  UserX,
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
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type StaffStatus = "active" | "on_leave" | "inactive"
type StaffRole =
  | "Engineer"
  | "Designer"
  | "Project Manager"
  | "Operations"
  | "Leadership"
  | "Other"

type StaffMember = {
  id: number
  fullName: string
  email: string
  phone: string
  role: StaffRole
  department: string
  status: StaffStatus
  joinedAt: string
  initials: string
  accent: string
}

type StatusFilter = "all" | StaffStatus

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")

const accentPalette = [
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-emerald-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-600 text-white",
  "bg-sky-600 text-white",
]

const initialMembers: StaffMember[] = [
  {
    id: 1,
    fullName: "Kemi Adeyemi",
    email: "kemi@techyx360.com",
    phone: "+234 803 111 2200",
    role: "Leadership",
    department: "Executive",
    status: "active",
    joinedAt: "2022-01-15",
    initials: "KA",
    accent: "bg-blue-600 text-white",
  },
  {
    id: 2,
    fullName: "Chidi Okonkwo",
    email: "chidi@techyx360.com",
    phone: "+234 809 441 1188",
    role: "Engineer",
    department: "Product Engineering",
    status: "active",
    joinedAt: "2023-04-02",
    initials: "CO",
    accent: "bg-violet-600 text-white",
  },
  {
    id: 3,
    fullName: "Amaka Nwosu",
    email: "amaka@techyx360.com",
    phone: "+234 701 555 3344",
    role: "Designer",
    department: "Design",
    status: "on_leave",
    joinedAt: "2023-09-18",
    initials: "AN",
    accent: "bg-rose-600 text-white",
  },
  {
    id: 4,
    fullName: "Tunde Bakare",
    email: "tunde@techyx360.com",
    phone: "+234 802 776 0091",
    role: "Project Manager",
    department: "Delivery",
    status: "active",
    joinedAt: "2024-02-10",
    initials: "TB",
    accent: "bg-emerald-600 text-white",
  },
  {
    id: 5,
    fullName: "Fatima Bello",
    email: "fatima@techyx360.com",
    phone: "+234 813 990 5522",
    role: "Operations",
    department: "Operations",
    status: "inactive",
    joinedAt: "2021-11-05",
    initials: "FB",
    accent: "bg-amber-600 text-white",
  },
]

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "inactive", label: "Inactive" },
]

function statusBadgeClass(status: StaffStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "on_leave":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "inactive":
      return "bg-muted text-muted-foreground"
  }
}

function statusLabel(status: StaffStatus) {
  switch (status) {
    case "active":
      return "Active"
    case "on_leave":
      return "On leave"
    case "inactive":
      return "Inactive"
  }
}

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "T"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
            accent
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function TeamDashboard() {
  const [members, setMembers] = useState(initialMembers)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [selected, setSelected] = useState<StaffMember | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<StaffRole>("Engineer")
  const [department, setDepartment] = useState("")
  const [status, setStatus] = useState<StaffStatus>("active")
  const [joinedAt, setJoinedAt] = useState("")

  const counts = useMemo(
    () => ({
      all: members.length,
      active: members.filter((member) => member.status === "active").length,
      on_leave: members.filter((member) => member.status === "on_leave").length,
      inactive: members.filter((member) => member.status === "inactive").length,
    }),
    [members]
  )

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return members.filter((member) => {
      const statusMatch =
        activeFilter === "all" || member.status === activeFilter
      const searchMatch =
        !normalizedQuery ||
        [
          member.fullName,
          member.email,
          member.role,
          member.department,
          member.phone,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return statusMatch && searchMatch
    })
  }, [activeFilter, members, query])

  function resetAddForm() {
    setFullName("")
    setEmail("")
    setPhone("")
    setRole("Engineer")
    setDepartment("")
    setStatus("active")
    setJoinedAt("")
  }

  function handleAddMember(event: FormEvent) {
    event.preventDefault()

    if (!fullName.trim() || !email.trim() || !department.trim()) {
      notify.error("Name, email, and department are required.")
      return
    }

    const nextId = Math.max(0, ...members.map((member) => member.id)) + 1
    const next: StaffMember = {
      id: nextId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || "—",
      role,
      department: department.trim(),
      status,
      joinedAt: joinedAt || new Date().toISOString().slice(0, 10),
      initials: initialsFromName(fullName),
      accent: accentPalette[nextId % accentPalette.length],
    }

    setMembers((current) => [next, ...current])
    setAddOpen(false)
    resetAddForm()
    setSelected(next)
    notify.success("Team member added.")
  }

  function deleteMember(id: number) {
    setMembers((current) => current.filter((member) => member.id !== id))
    setDeleteTarget(null)
    if (selected?.id === id) setSelected(null)
    notify.success("Team member removed.")
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Team</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Staff</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Team
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage internal staff, roles, and team directory.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Add member
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total staff"
          value={counts.all}
          icon={Users}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Active"
          value={counts.active}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="On leave"
          value={counts.on_leave}
          icon={UserRound}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="Inactive"
          value={counts.inactive}
          icon={UserX}
          accent="bg-muted text-muted-foreground"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-wrap gap-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  activeFilter === filter.value
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter.label}
                <span className="ml-1.5 tabular-nums text-xs opacity-70">
                  {counts[filter.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, role, email..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        {filteredMembers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => setSelected(member)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                            member.accent
                          )}
                        >
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {member.fullName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            Joined {formatDisplayDate(member.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">{member.role}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {member.department}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="truncate text-foreground">{member.email}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {member.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={cn(
                          "border-0 font-semibold capitalize",
                          statusBadgeClass(member.status)
                        )}
                      >
                        {statusLabel(member.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-lg text-muted-foreground"
                        aria-label={`Open ${member.fullName}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelected(member)
                        }}
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No team members match your filters.
          </div>
        )}
      </section>

      <Sheet
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <SheetContent
          side="right"
          showCloseButton
          className="admin-ui w-full gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:w-[45vw] data-[side=right]:sm:max-w-[45vw]"
        >
          {selected ? (
            <>
              <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 p-5 pr-12 text-left">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                      selected.accent
                    )}
                  >
                    {selected.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SheetTitle className="text-base font-bold text-foreground">
                        {selected.fullName}
                      </SheetTitle>
                      <Badge
                        className={cn(
                          "border-0 font-semibold capitalize",
                          statusBadgeClass(selected.status)
                        )}
                      >
                        {statusLabel(selected.status)}
                      </Badge>
                    </div>
                    <SheetDescription className="mt-1">
                      {selected.role} · {selected.department}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
                <section className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">Contact</h3>
                  <div className="space-y-3">
                    <a
                      href={`mailto:${selected.email}`}
                      className="flex items-center gap-3 text-sm text-brand hover:underline"
                    >
                      <Mail className="size-4 shrink-0" aria-hidden />
                      {selected.email}
                    </a>
                    <a
                      href={`tel:${selected.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-3 text-sm text-foreground hover:underline"
                    >
                      <Phone className="size-4 shrink-0 text-brand" aria-hidden />
                      {selected.phone}
                    </a>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selected.role}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selected.department}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatDisplayDate(selected.joinedAt)}
                    </p>
                  </div>
                </section>
              </div>

              <div className="shrink-0 border-t border-border/60 p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-xl text-red-600 hover:text-red-600"
                  onClick={() => setDeleteTarget(selected)}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Remove member
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
            <DialogDescription>
              Add an internal staff member to the team directory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-3">
            <div>
              <label htmlFor="team-name" className={labelClassName}>
                Full name
              </label>
              <Input
                id="team-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Chidi Okonkwo"
                className={fieldClassName}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="team-email" className={labelClassName}>
                  Email
                </label>
                <Input
                  id="team-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@techyx360.com"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="team-phone" className={labelClassName}>
                  Phone
                </label>
                <Input
                  id="team-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+234 ..."
                  className={fieldClassName}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="team-role" className={labelClassName}>
                  Role
                </label>
                <select
                  id="team-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as StaffRole)}
                  className={selectClassName}
                >
                  <option value="Engineer">Engineer</option>
                  <option value="Designer">Designer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Operations">Operations</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="team-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="team-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as StaffStatus)
                  }
                  className={selectClassName}
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="team-department" className={labelClassName}>
                  Department
                </label>
                <Input
                  id="team-department"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Product Engineering"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="team-joined" className={labelClassName}>
                  Joined
                </label>
                <Input
                  id="team-joined"
                  type="date"
                  value={joinedAt}
                  onChange={(event) => setJoinedAt(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <BriefcaseBusiness className="size-4" aria-hidden />
                Save member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              {deleteTarget ? deleteTarget.fullName : "this member"} from the
              team directory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteMember(deleteTarget.id)
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
