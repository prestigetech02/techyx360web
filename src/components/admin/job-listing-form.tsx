"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Button } from "@/components/ui/button"
import { DropdownField } from "@/components/ui/dropdown"
import { Input } from "@/components/ui/input"
import { careerEmploymentTypeOptions } from "@/config/careers"
import { isRichTextEmpty } from "@/lib/blog/content"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"
const textareaClassName = cn(
  fieldClassName,
  "min-h-[120px] resize-y py-3 leading-relaxed"
)

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
]

const iconOptions = [
  { value: "code", label: "Code (Engineering)" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product / Briefcase" },
  { value: "support", label: "Support" },
]

const employmentTypeOptions = careerEmploymentTypeOptions.map((option) => ({
  value: option.value,
  label: option.label,
}))

function slugifyPreview(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function JobListingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [status, setStatus] = useState("open")
  const [icon, setIcon] = useState("product")
  const [employmentType, setEmploymentType] = useState("Full-time")
  const [overview, setOverview] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (isRichTextEmpty(overview)) {
      const message = "Please add content for About the role."
      setError(message)
      notify.error(message)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      department: String(formData.get("department") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      employmentType,
      description: String(formData.get("description") ?? "").trim(),
      overview,
      responsibilities: String(formData.get("responsibilities") ?? ""),
      requirements: String(formData.get("requirements") ?? ""),
      niceToHave: String(formData.get("niceToHave") ?? ""),
      benefits: String(formData.get("benefits") ?? ""),
      status,
      icon,
      salaryMin: formData.get("salaryMin"),
      salaryMax: formData.get("salaryMax"),
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/job-openings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => null)) as {
        error?: string
        listing?: { slug: string }
      } | null

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to create listing.")
      }

      notify.success("Job listing created.")
      router.push("/admin/job-listings")
      router.refresh()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to create listing."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="job-title" className={labelClassName}>
            Job title
          </label>
          <Input
            id="job-title"
            name="title"
            required
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value
              setTitle(nextTitle)
              if (!slugTouched) {
                setSlug(slugifyPreview(nextTitle))
              }
            }}
            placeholder="e.g. Full Stack Developer"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-slug" className={labelClassName}>
            Slug
          </label>
          <Input
            id="job-slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(slugifyPreview(event.target.value))
            }}
            placeholder="full-stack-developer"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-department" className={labelClassName}>
            Department
          </label>
          <Input
            id="job-department"
            name="department"
            required
            placeholder="e.g. Engineering"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-location" className={labelClassName}>
            Location
          </label>
          <Input
            id="job-location"
            name="location"
            required
            placeholder="e.g. Lagos, Nigeria"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-type" className={labelClassName}>
            Employment type
          </label>
          <DropdownField
            id="job-type"
            placeholder="Select employment type"
            options={employmentTypeOptions}
            value={employmentType}
            onValueChange={(value) =>
              setEmploymentType(value ?? "Full-time")
            }
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-status" className={labelClassName}>
            Status
          </label>
          <DropdownField
            id="job-status"
            placeholder="Select status"
            options={statusOptions}
            value={status}
            onValueChange={(value) => setStatus(value ?? "open")}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-icon" className={labelClassName}>
            Icon
          </label>
          <DropdownField
            id="job-icon"
            placeholder="Select icon"
            options={iconOptions}
            value={icon}
            onValueChange={(value) => setIcon(value ?? "product")}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-salaryMin" className={labelClassName}>
            Salary min (NGN / month)
          </label>
          <Input
            id="job-salaryMin"
            name="salaryMin"
            type="number"
            min={0}
            step={10000}
            placeholder="e.g. 300000"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="job-salaryMax" className={labelClassName}>
            Salary max (NGN / month)
          </label>
          <Input
            id="job-salaryMax"
            name="salaryMax"
            type="number"
            min={0}
            step={10000}
            placeholder="e.g. 600000"
            className={fieldClassName}
          />
        </div>
      </div>

      <p className="-mt-2 text-xs text-muted-foreground">
        Salary is optional. Leave blank to keep pay undisclosed on the site.
      </p>

      <div>
        <label htmlFor="job-description" className={labelClassName}>
          Short description
        </label>
        <textarea
          id="job-description"
          name="description"
          required
          rows={3}
          placeholder="One or two sentences shown on the careers listing cards."
          className={textareaClassName}
        />
      </div>

      <div>
        <label htmlFor="job-overview" className={labelClassName}>
          About the role
        </label>
        <RichTextEditor
          id="job-overview"
          value={overview}
          onChange={setOverview}
          placeholder="Describe the role. Use headings, lists, and emphasis to structure the overview."
          className="min-h-[240px]"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Format with the toolbar. This content renders as rich text on the job
          detail page.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="job-responsibilities" className={labelClassName}>
            Responsibilities
          </label>
          <textarea
            id="job-responsibilities"
            name="responsibilities"
            rows={5}
            placeholder="One item per line"
            className={textareaClassName}
          />
        </div>
        <div>
          <label htmlFor="job-requirements" className={labelClassName}>
            Requirements
          </label>
          <textarea
            id="job-requirements"
            name="requirements"
            rows={5}
            placeholder="One item per line"
            className={textareaClassName}
          />
        </div>
        <div>
          <label htmlFor="job-niceToHave" className={labelClassName}>
            Nice to have
          </label>
          <textarea
            id="job-niceToHave"
            name="niceToHave"
            rows={5}
            placeholder="One item per line"
            className={textareaClassName}
          />
        </div>
        <div>
          <label htmlFor="job-benefits" className={labelClassName}>
            Benefits
          </label>
          <textarea
            id="job-benefits"
            name="benefits"
            rows={5}
            placeholder="One item per line"
            className={textareaClassName}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => router.push("/admin/job-listings")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          {isSubmitting ? "Creating..." : "Create listing"}
        </Button>
      </div>
    </form>
  )
}
