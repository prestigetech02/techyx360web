"use client"

import {
  useMemo,
  useState,
  useTransition,
  type ComponentType,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react"
import { useRouter } from "next/navigation"
import {
  BriefcaseBusiness,
  Cake,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  UserX,
  Wallet,
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
  DOCUMENT_TYPES,
  PAYMENT_FREQUENCIES,
  SALARY_CURRENCIES,
  STAFF_GENDERS,
  STAFF_ROLES,
  formatSalaryAmount,
  getAgeFromDateOfBirth,
  getNextBirthdayLabel,
  type DocumentType,
  type PaymentFrequency,
  type SalaryCurrency,
  type StaffGender,
  type StaffRole,
  type StaffStatus,
  type TeamMemberDocumentView,
  type TeamMemberView,
} from "@/lib/team/team-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | StaffStatus
type DetailTab = "bio" | "birthday" | "documents" | "salaries"

type DraftDocument = {
  key: string
  title: string
  docType: DocumentType
  notes: string
}

type MemberFormState = {
  fullName: string
  email: string
  phone: string
  role: StaffRole
  department: string
  status: StaffStatus
  joinedAt: string
  gender: StaffGender | ""
  address: string
  dateOfBirth: string
  baseSalary: string
  salaryCurrency: SalaryCurrency
  paymentFrequency: PaymentFrequency | ""
  bankName: string
  accountName: string
  accountNumber: string
  documents: DraftDocument[]
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")
const sectionTitleClassName =
  "text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "inactive", label: "Inactive" },
]

const detailTabs: Array<{ value: DetailTab; label: string }> = [
  { value: "bio", label: "Bio data" },
  { value: "birthday", label: "Birthday" },
  { value: "documents", label: "Documents" },
  { value: "salaries", label: "Salaries & Payments" },
]

const emptyFormState = (): MemberFormState => ({
  fullName: "",
  email: "",
  phone: "",
  role: "Engineer",
  department: "",
  status: "active",
  joinedAt: "",
  gender: "",
  address: "",
  dateOfBirth: "",
  baseSalary: "",
  salaryCurrency: "NGN",
  paymentFrequency: "Monthly",
  bankName: "",
  accountName: "",
  accountNumber: "",
  documents: [],
})

function formStateFromMember(member: TeamMemberView): MemberFormState {
  return {
    fullName: member.fullName,
    email: member.email,
    phone: member.phone === "—" ? "" : member.phone,
    role: member.role,
    department: member.department,
    status: member.status,
    joinedAt: member.joinedAt,
    gender: member.gender ?? "",
    address: member.address,
    dateOfBirth: member.dateOfBirth ?? "",
    baseSalary:
      member.baseSalary == null ? "" : String(Math.round(member.baseSalary)),
    salaryCurrency: member.salaryCurrency,
    paymentFrequency: member.paymentFrequency ?? "",
    bankName: member.bankName,
    accountName: member.accountName,
    accountNumber: member.accountNumber,
    documents: [],
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? fallback
}

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

function buildMemberPayload(form: MemberFormState, includeDocuments: boolean) {
  return {
    full_name: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    role: form.role,
    department: form.department.trim(),
    status: form.status,
    joined_at: form.joinedAt || null,
    gender: form.gender || null,
    address: form.address.trim() || null,
    date_of_birth: form.dateOfBirth || null,
    base_salary: form.baseSalary.trim() || null,
    salary_currency: form.salaryCurrency,
    payment_frequency: form.paymentFrequency || null,
    bank_name: form.bankName.trim() || null,
    account_name: form.accountName.trim() || null,
    account_number: form.accountNumber.trim() || null,
    ...(includeDocuments
      ? {
          documents: form.documents
            .filter((document) => document.title.trim())
            .map((document) => ({
              title: document.title.trim(),
              doc_type: document.docType,
              notes: document.notes.trim() || null,
            })),
        }
      : {}),
  }
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

function EmptyDetailState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

function MemberFormFields({
  form,
  setForm,
  idPrefix,
  disabled,
  showDocuments,
}: {
  form: MemberFormState
  setForm: Dispatch<SetStateAction<MemberFormState>>
  idPrefix: string
  disabled?: boolean
  showDocuments?: boolean
}) {
  function updateField<K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function addDraftDocument() {
    setForm((current) => ({
      ...current,
      documents: [
        ...current.documents,
        {
          key: `doc-${Date.now()}-${current.documents.length}`,
          title: "",
          docType: "Contract",
          notes: "",
        },
      ],
    }))
  }

  function updateDraftDocument(
    key: string,
    patch: Partial<Omit<DraftDocument, "key">>
  ) {
    setForm((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.key === key ? { ...document, ...patch } : document
      ),
    }))
  }

  function removeDraftDocument(key: string) {
    setForm((current) => ({
      ...current,
      documents: current.documents.filter((document) => document.key !== key),
    }))
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h3 className={sectionTitleClassName}>Bio data</h3>
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelClassName}>
            Full name
          </label>
          <Input
            id={`${idPrefix}-name`}
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="e.g. Chidi Okonkwo"
            className={fieldClassName}
            required
            disabled={disabled}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-email`} className={labelClassName}>
              Email
            </label>
            <Input
              id={`${idPrefix}-email`}
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@techyx360.com"
              className={fieldClassName}
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-phone`} className={labelClassName}>
              Phone
            </label>
            <Input
              id={`${idPrefix}-phone`}
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+234 ..."
              className={fieldClassName}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-role`} className={labelClassName}>
              Role
            </label>
            <select
              id={`${idPrefix}-role`}
              value={form.role}
              onChange={(event) =>
                updateField("role", event.target.value as StaffRole)
              }
              className={selectClassName}
              disabled={disabled}
            >
              {STAFF_ROLES.map((staffRole) => (
                <option key={staffRole} value={staffRole}>
                  {staffRole}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${idPrefix}-status`} className={labelClassName}>
              Status
            </label>
            <select
              id={`${idPrefix}-status`}
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as StaffStatus)
              }
              className={selectClassName}
              disabled={disabled}
            >
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${idPrefix}-department`}
              className={labelClassName}
            >
              Department
            </label>
            <Input
              id={`${idPrefix}-department`}
              value={form.department}
              onChange={(event) =>
                updateField("department", event.target.value)
              }
              placeholder="Product Engineering"
              className={fieldClassName}
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-joined`} className={labelClassName}>
              Joined
            </label>
            <Input
              id={`${idPrefix}-joined`}
              type="date"
              value={form.joinedAt}
              onChange={(event) => updateField("joinedAt", event.target.value)}
              className={fieldClassName}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-gender`} className={labelClassName}>
              Gender
            </label>
            <select
              id={`${idPrefix}-gender`}
              value={form.gender}
              onChange={(event) =>
                updateField("gender", event.target.value as StaffGender | "")
              }
              className={selectClassName}
              disabled={disabled}
            >
              <option value="">Not set</option>
              {STAFF_GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${idPrefix}-address`} className={labelClassName}>
              Address
            </label>
            <Input
              id={`${idPrefix}-address`}
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="City, Country"
              className={fieldClassName}
              disabled={disabled}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-5">
        <h3 className={sectionTitleClassName}>Birthday</h3>
        <div>
          <label htmlFor={`${idPrefix}-dob`} className={labelClassName}>
            Date of birth
          </label>
          <Input
            id={`${idPrefix}-dob`}
            type="date"
            value={form.dateOfBirth}
            onChange={(event) =>
              updateField("dateOfBirth", event.target.value)
            }
            className={fieldClassName}
            disabled={disabled}
          />
        </div>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-5">
        <h3 className={sectionTitleClassName}>Salaries & Payments</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-salary`} className={labelClassName}>
              Base salary
            </label>
            <Input
              id={`${idPrefix}-salary`}
              type="number"
              min="0"
              step="1000"
              value={form.baseSalary}
              onChange={(event) =>
                updateField("baseSalary", event.target.value)
              }
              placeholder="500000"
              className={fieldClassName}
              disabled={disabled}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-currency`} className={labelClassName}>
              Currency
            </label>
            <select
              id={`${idPrefix}-currency`}
              value={form.salaryCurrency}
              onChange={(event) =>
                updateField(
                  "salaryCurrency",
                  event.target.value as SalaryCurrency
                )
              }
              className={selectClassName}
              disabled={disabled}
            >
              {SALARY_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-frequency`} className={labelClassName}>
            Payment frequency
          </label>
          <select
            id={`${idPrefix}-frequency`}
            value={form.paymentFrequency}
            onChange={(event) =>
              updateField(
                "paymentFrequency",
                event.target.value as PaymentFrequency | ""
              )
            }
            className={selectClassName}
            disabled={disabled}
          >
            <option value="">Not set</option>
            {PAYMENT_FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-bank`} className={labelClassName}>
              Bank name
            </label>
            <Input
              id={`${idPrefix}-bank`}
              value={form.bankName}
              onChange={(event) => updateField("bankName", event.target.value)}
              placeholder="GTBank"
              className={fieldClassName}
              disabled={disabled}
            />
          </div>
          <div>
            <label
              htmlFor={`${idPrefix}-account-name`}
              className={labelClassName}
            >
              Account name
            </label>
            <Input
              id={`${idPrefix}-account-name`}
              value={form.accountName}
              onChange={(event) =>
                updateField("accountName", event.target.value)
              }
              placeholder="Account holder"
              className={fieldClassName}
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-account-number`}
            className={labelClassName}
          >
            Account number
          </label>
          <Input
            id={`${idPrefix}-account-number`}
            value={form.accountNumber}
            onChange={(event) =>
              updateField("accountNumber", event.target.value)
            }
            placeholder="0123456789"
            className={fieldClassName}
            disabled={disabled}
          />
        </div>
      </section>

      {showDocuments ? (
        <section className="space-y-3 border-t border-border/60 pt-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className={sectionTitleClassName}>Documents</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg"
              onClick={addDraftDocument}
              disabled={disabled}
            >
              <Plus className="size-3.5" aria-hidden />
              Add
            </Button>
          </div>
          {form.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Optional. You can also add documents later from the employee
              profile.
            </p>
          ) : (
            <div className="space-y-3">
              {form.documents.map((document, index) => (
                <div
                  key={document.key}
                  className="space-y-3 rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Document {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-red-600"
                      onClick={() => removeDraftDocument(document.key)}
                      disabled={disabled}
                      aria-label={`Remove document ${index + 1}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${idPrefix}-doc-title-${document.key}`}
                        className={labelClassName}
                      >
                        Title
                      </label>
                      <Input
                        id={`${idPrefix}-doc-title-${document.key}`}
                        value={document.title}
                        onChange={(event) =>
                          updateDraftDocument(document.key, {
                            title: event.target.value,
                          })
                        }
                        placeholder="Employment contract"
                        className={fieldClassName}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`${idPrefix}-doc-type-${document.key}`}
                        className={labelClassName}
                      >
                        Type
                      </label>
                      <select
                        id={`${idPrefix}-doc-type-${document.key}`}
                        value={document.docType}
                        onChange={(event) =>
                          updateDraftDocument(document.key, {
                            docType: event.target.value as DocumentType,
                          })
                        }
                        className={selectClassName}
                        disabled={disabled}
                      >
                        {DOCUMENT_TYPES.map((docType) => (
                          <option key={docType} value={docType}>
                            {docType}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor={`${idPrefix}-doc-notes-${document.key}`}
                      className={labelClassName}
                    >
                      Notes
                    </label>
                    <Input
                      id={`${idPrefix}-doc-notes-${document.key}`}
                      value={document.notes}
                      onChange={(event) =>
                        updateDraftDocument(document.key, {
                          notes: event.target.value,
                        })
                      }
                      placeholder="Optional notes"
                      className={fieldClassName}
                      disabled={disabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

function TeamMemberDetail({
  member,
  onRemove,
  onUpdated,
}: {
  member: TeamMemberView
  onRemove: () => void
  onUpdated: () => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("bio")
  const [editOpen, setEditOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState(() => formStateFromMember(member))
  const [docTitle, setDocTitle] = useState("")
  const [docType, setDocType] = useState<DocumentType>("Contract")
  const [docNotes, setDocNotes] = useState("")
  const [addingDocument, setAddingDocument] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  )

  const age = getAgeFromDateOfBirth(member.dateOfBirth)
  const nextBirthday = getNextBirthdayLabel(member.dateOfBirth)

  function openEditDialog() {
    setEditForm(formStateFromMember(member))
    setEditOpen(true)
  }

  async function saveMember(event: FormEvent) {
    event.preventDefault()
    if (savingEdit) return

    if (
      !editForm.fullName.trim() ||
      !editForm.email.trim() ||
      !editForm.department.trim()
    ) {
      notify.error("Name, email, and department are required.")
      return
    }

    setSavingEdit(true)
    try {
      const response = await fetch(`/api/admin/team-members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMemberPayload(editForm, false)),
      })

      if (!response.ok) {
        notify.error(
          await readErrorMessage(response, "Unable to update team member.")
        )
        return
      }

      setEditOpen(false)
      notify.success("Team member updated.")
      onUpdated()
    } finally {
      setSavingEdit(false)
    }
  }

  async function addDocument(event: FormEvent) {
    event.preventDefault()
    if (!docTitle.trim() || addingDocument) return

    setAddingDocument(true)
    try {
      const response = await fetch(
        `/api/admin/team-members/${member.id}/documents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: docTitle.trim(),
            doc_type: docType,
            notes: docNotes.trim() || null,
          }),
        }
      )

      if (!response.ok) {
        notify.error(
          await readErrorMessage(response, "Unable to add document.")
        )
        return
      }

      setDocTitle("")
      setDocType("Contract")
      setDocNotes("")
      notify.success("Document added.")
      onUpdated()
    } finally {
      setAddingDocument(false)
    }
  }

  async function deleteDocument(document: TeamMemberDocumentView) {
    setDeletingDocumentId(document.id)
    try {
      const response = await fetch(
        `/api/admin/team-members/${member.id}/documents/${document.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        notify.error(
          await readErrorMessage(response, "Unable to delete document.")
        )
        return
      }

      notify.success("Document removed.")
      onUpdated()
    } finally {
      setDeletingDocumentId(null)
    }
  }

  return (
    <>
      <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 p-5 pr-12 text-left">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
              member.accent
            )}
          >
            {member.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-base font-bold text-foreground">
                {member.fullName}
              </SheetTitle>
              <Badge
                className={cn(
                  "border-0 font-semibold capitalize",
                  statusBadgeClass(member.status)
                )}
              >
                {statusLabel(member.status)}
              </Badge>
            </div>
            <SheetDescription className="mt-1">
              {member.role} · {member.department}
            </SheetDescription>
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
      </SheetHeader>

      <div className="shrink-0 overflow-x-auto border-b border-border/60 px-5">
        <div className="flex min-w-max gap-1">
          {detailTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                activeTab === tab.value
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
        {activeTab === "bio" ? (
          <>
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Contact</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-3 text-sm text-brand hover:underline"
                >
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {member.email}
                </a>
                {member.phone !== "—" ? (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-sm text-foreground hover:underline"
                  >
                    <Phone className="size-4 shrink-0 text-brand" aria-hidden />
                    {member.phone}
                  </a>
                ) : (
                  <p className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    No phone on file
                  </p>
                )}
                {member.address ? (
                  <p className="flex items-start gap-3 text-sm text-foreground">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-brand"
                      aria-hidden
                    />
                    {member.address}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {member.role}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {member.department}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {member.gender ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {statusLabel(member.status)}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDisplayDate(member.joinedAt)}
                </p>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "birthday" ? (
          member.dateOfBirth ? (
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 p-4 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Cake className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of birth</p>
                    <p className="mt-1 text-base font-semibold text-foreground">
                      {formatDisplayDate(member.dateOfBirth)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {age != null ? `${age} years` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs text-muted-foreground">Next birthday</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {nextBirthday ?? "—"}
                </p>
              </div>
            </section>
          ) : (
            <EmptyDetailState
              icon={Cake}
              title="No birthday on file"
              description="Add this employee's date of birth using Edit."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={openEditDialog}
                >
                  <Pencil className="size-4" aria-hidden />
                  Add birthday
                </Button>
              }
            />
          )
        ) : null}

        {activeTab === "documents" ? (
          <div className="space-y-5">
            <form
              onSubmit={(event) => void addDocument(event)}
              className="space-y-3 rounded-2xl border border-border/60 p-4"
            >
              <h3 className="text-sm font-bold text-foreground">Add document</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="detail-doc-title" className={labelClassName}>
                    Title
                  </label>
                  <Input
                    id="detail-doc-title"
                    value={docTitle}
                    onChange={(event) => setDocTitle(event.target.value)}
                    placeholder="Employment contract"
                    className={fieldClassName}
                    required
                    disabled={addingDocument}
                  />
                </div>
                <div>
                  <label htmlFor="detail-doc-type" className={labelClassName}>
                    Type
                  </label>
                  <select
                    id="detail-doc-type"
                    value={docType}
                    onChange={(event) =>
                      setDocType(event.target.value as DocumentType)
                    }
                    className={selectClassName}
                    disabled={addingDocument}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="detail-doc-notes" className={labelClassName}>
                  Notes
                </label>
                <Input
                  id="detail-doc-notes"
                  value={docNotes}
                  onChange={(event) => setDocNotes(event.target.value)}
                  placeholder="Optional notes"
                  className={fieldClassName}
                  disabled={addingDocument}
                />
              </div>
              <Button
                type="submit"
                className="h-10 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={addingDocument}
              >
                {addingDocument ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="size-4" aria-hidden />
                )}
                {addingDocument ? "Adding..." : "Add document"}
              </Button>
            </form>

            {member.documents.length === 0 ? (
              <EmptyDetailState
                icon={FileText}
                title="No documents yet"
                description="Contracts, IDs, and other employee files will show up here."
              />
            ) : (
              <ul className="space-y-3">
                {member.documents.map((document) => (
                  <li
                    key={document.id}
                    className="rounded-xl border border-border/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {document.title}
                          </p>
                          <Badge className="border-0 bg-muted font-semibold text-muted-foreground">
                            {document.docType}
                          </Badge>
                        </div>
                        {document.notes ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {document.notes}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Added{" "}
                          {new Date(document.createdAt).toLocaleDateString(
                            undefined,
                            { dateStyle: "medium" }
                          )}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg text-red-600"
                        disabled={deletingDocumentId === document.id}
                        onClick={() => void deleteDocument(document)}
                        aria-label={`Delete ${document.title}`}
                      >
                        {deletingDocumentId === document.id ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="size-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === "salaries" ? (
          member.baseSalary != null ||
          member.paymentFrequency ||
          member.bankName ||
          member.accountNumber ? (
            <section className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs text-muted-foreground">Base salary</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {formatSalaryAmount(
                      member.baseSalary,
                      member.salaryCurrency
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs text-muted-foreground">
                    Payment frequency
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {member.paymentFrequency ?? "—"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <h3 className="text-sm font-bold text-foreground">
                  Bank details
                </h3>
                <dl className="mt-3 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Bank</dt>
                    <dd className="font-medium text-foreground">
                      {member.bankName || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Account name</dt>
                    <dd className="font-medium text-foreground">
                      {member.accountName || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Account number</dt>
                    <dd className="font-medium text-foreground">
                      {member.accountNumber || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          ) : (
            <EmptyDetailState
              icon={Wallet}
              title="No salaries or payments yet"
              description="Add salary and bank details using Edit."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={openEditDialog}
                >
                  <Pencil className="size-4" aria-hidden />
                  Add salary details
                </Button>
              }
            />
          )
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border/60 p-4">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 rounded-xl text-red-600 hover:text-red-600"
          onClick={onRemove}
        >
          <Trash2 className="size-4" aria-hidden />
          Remove member
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit team member</DialogTitle>
            <DialogDescription>
              Update bio data, birthday, and salary details for {member.fullName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void saveMember(event)} className="space-y-3">
            <MemberFormFields
              form={editForm}
              setForm={setEditForm}
              idPrefix="edit-team"
              disabled={savingEdit}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-xl"
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Pencil className="size-4" aria-hidden />
                )}
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

type TeamDashboardProps = {
  members: TeamMemberView[]
}

export function TeamDashboard({ members }: TeamDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberView | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addForm, setAddForm] = useState<MemberFormState>(emptyFormState)

  const selected = useMemo(
    () => members.find((member) => member.id === selectedId) ?? null,
    [members, selectedId]
  )

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

  function refreshMembers() {
    startTransition(() => {
      router.refresh()
    })
  }

  function resetAddForm() {
    setAddForm(emptyFormState())
  }

  async function handleAddMember(event: FormEvent) {
    event.preventDefault()

    if (
      !addForm.fullName.trim() ||
      !addForm.email.trim() ||
      !addForm.department.trim()
    ) {
      notify.error("Name, email, and department are required.")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMemberPayload(addForm, true)),
      })

      if (!response.ok) {
        notify.error(
          await readErrorMessage(response, "Unable to add team member.")
        )
        return
      }

      const data = (await response.json()) as { member?: TeamMemberView }
      setAddOpen(false)
      resetAddForm()
      if (data.member?.id) {
        setSelectedId(data.member.id)
      }
      notify.success("Team member added.")
      refreshMembers()
    } finally {
      setCreating(false)
    }
  }

  async function deleteMember(id: string) {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/team-members/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        notify.error(
          await readErrorMessage(response, "Unable to remove team member.")
        )
        return
      }

      setDeleteTarget(null)
      if (selectedId === id) setSelectedId(null)
      notify.success("Team member removed.")
      refreshMembers()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={cn("min-w-0 space-y-6", isPending && "opacity-80")}>
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
                    onClick={() => setSelectedId(member.id)}
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
                          setSelectedId(member.id)
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
            {members.length === 0
              ? "No team members yet. Add your first staff member."
              : "No team members match your filters."}
          </div>
        )}
      </section>

      <Sheet
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent
          side="right"
          showCloseButton
          className="admin-ui w-full gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:w-[45vw] data-[side=right]:sm:max-w-[45vw]"
        >
          {selected ? (
            <TeamMemberDetail
              key={selected.id}
              member={selected}
              onRemove={() => setDeleteTarget(selected)}
              onUpdated={refreshMembers}
            />
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
              Capture bio data, birthday, documents, and salary details for the
              new employee.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void handleAddMember(event)}
            className="space-y-3"
          >
            <MemberFormFields
              form={addForm}
              setForm={setAddForm}
              idPrefix="add-team"
              disabled={creating}
              showDocuments
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="rounded-xl"
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <BriefcaseBusiness className="size-4" aria-hidden />
                )}
                {creating ? "Saving..." : "Save member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
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
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                if (deleteTarget) void deleteMember(deleteTarget.id)
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
