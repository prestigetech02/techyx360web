"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { FeaturedImageUpload } from "@/components/admin/featured-image-upload"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Button } from "@/components/ui/button"
import { DropdownField } from "@/components/ui/dropdown"
import { Input } from "@/components/ui/input"
import { isRichTextEmpty } from "@/lib/blog/content"
import { estimateReadTimeMins, slugify } from "@/lib/blog/posts"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

type BlogPostFormValues = {
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  tags: string
  metaDescription: string
  metaKeywords: string
  featuredImage: string
  featuredImageAlt: string
  publishedAt: string
  status: "draft" | "published"
}

type BlogPostFormProps = {
  mode?: "create" | "edit"
  initialValues?: Partial<BlogPostFormValues>
  postId?: string
}

const defaultPublishedAt = new Date().toISOString().slice(0, 10)

const defaultValues: BlogPostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "Techyx360 Team",
  tags: "",
  metaDescription: "",
  metaKeywords: "",
  featuredImage: "",
  featuredImageAlt: "",
  publishedAt: defaultPublishedAt,
  status: "draft",
}

export function BlogPostForm({
  mode = "create",
  initialValues,
  postId,
}: BlogPostFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<BlogPostFormValues>({
    ...defaultValues,
    ...initialValues,
  })
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estimatedReadTime = useMemo(
    () => estimateReadTimeMins(values.content),
    [values.content]
  )

  const updateField = <K extends keyof BlogPostFormValues>(
    key: K,
    value: BlogPostFormValues[K]
  ) => {
    setValues((current) => {
      const next = { ...current, [key]: value }

      if (key === "title" && !slugTouched) {
        next.slug = slugify(String(value))
      }

      if (key === "slug") {
        next.slug = slugify(String(value))
      }

      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (isRichTextEmpty(values.content)) {
      const message = "Post content is required."
      setError(message)
      notify.error(message)
      return
    }

    if (!values.featuredImage.trim()) {
      const message = "Featured image is required."
      setError(message)
      notify.error(message)
      return
    }

    if (!values.featuredImageAlt.trim()) {
      const message = "Featured image alt text is required."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    const payload = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      author: values.author,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      metaDescription: values.metaDescription,
      metaKeywords: values.metaKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      featuredImage: values.featuredImage,
      featuredImageAlt: values.featuredImageAlt,
      publishedAt: values.publishedAt,
      status: values.status,
    }

    try {
      const endpoint =
        mode === "edit" && postId
          ? `/api/admin/blog-posts/${postId}`
          : "/api/admin/blog-posts"

      const response = await fetch(endpoint, {
        method: mode === "edit" && postId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as {
        error?: string
        post?: { slug: string }
      }

      if (!response.ok) {
        const message = result.error ?? "Unable to save blog post right now."
        setError(message)
        notify.error(message)
        return
      }

      notify.success(
        mode === "edit"
          ? "Blog post updated successfully."
          : values.status === "published"
            ? "Blog post published successfully."
            : "Blog post saved as draft."
      )

      router.push("/admin/blog")
      router.refresh()
    } catch {
      const message = "Unable to save blog post right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label htmlFor="blog-title" className={labelClassName}>
            Title
          </label>
          <Input
            id="blog-title"
            name="title"
            type="text"
            required
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Post title"
            className={fieldClassName}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Used as the page and social sharing title.
          </p>
        </div>

        <div>
          <label htmlFor="blog-slug" className={labelClassName}>
            Slug
          </label>
          <Input
            id="blog-slug"
            name="slug"
            type="text"
            required
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true)
              updateField("slug", event.target.value)
            }}
            placeholder="post-url-slug"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="blog-author" className={labelClassName}>
            Author
          </label>
          <Input
            id="blog-author"
            name="author"
            type="text"
            required
            value={values.author}
            onChange={(event) => updateField("author", event.target.value)}
            placeholder="Techyx360 Team"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="blog-published-at" className={labelClassName}>
            Published date
          </label>
          <Input
            id="blog-published-at"
            name="publishedAt"
            type="date"
            required
            value={values.publishedAt}
            onChange={(event) => updateField("publishedAt", event.target.value)}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="blog-status" className={labelClassName}>
            Status
          </label>
          <DropdownField
            id="blog-status"
            name="status"
            value={values.status}
            onValueChange={(value) =>
              updateField("status", value as BlogPostFormValues["status"])
            }
            className={fieldClassName}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="blog-excerpt" className={labelClassName}>
            Excerpt
          </label>
          <textarea
            id="blog-excerpt"
            name="excerpt"
            required
            rows={3}
            value={values.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            placeholder="Short summary shown on the blog listing cards."
            className={cn(
              fieldClassName,
              "min-h-[96px] resize-y py-3 leading-relaxed"
            )}
          />
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-muted/20 p-5">
          <h3 className="text-sm font-semibold text-foreground">SEO</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            The post title is used as the meta title. The featured image is used
            when sharing on social platforms.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="blog-meta-description" className={labelClassName}>
                Meta description
              </label>
              <textarea
                id="blog-meta-description"
                name="metaDescription"
                rows={3}
                value={values.metaDescription}
                onChange={(event) =>
                  updateField("metaDescription", event.target.value)
                }
                placeholder="Search and social preview description. Falls back to the excerpt if empty."
                className={cn(
                  fieldClassName,
                  "min-h-[96px] resize-y py-3 leading-relaxed"
                )}
              />
            </div>

            <div>
              <label htmlFor="blog-meta-keywords" className={labelClassName}>
                Meta keywords
              </label>
              <Input
                id="blog-meta-keywords"
                name="metaKeywords"
                type="text"
                value={values.metaKeywords}
                onChange={(event) =>
                  updateField("metaKeywords", event.target.value)
                }
                placeholder="mobile apps, security, Nigeria"
                className={fieldClassName}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Comma-separated SEO keywords. Post tags are used if this is
                left empty.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="blog-content" className={labelClassName}>
              Content
            </label>
            <span className="text-xs text-muted-foreground">
              Est. read time: {estimatedReadTime} min
            </span>
          </div>
          <RichTextEditor
            id="blog-content"
            value={values.content}
            onChange={(content) => updateField("content", content)}
            placeholder="Write your article. Use headings, lists, links, and emphasis to structure the post."
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Format content with the toolbar. Published posts render this as rich
            HTML on the blog.
          </p>
        </div>

        <div>
          <label htmlFor="blog-tags" className={labelClassName}>
            Tags
          </label>
          <Input
            id="blog-tags"
            name="tags"
            type="text"
            value={values.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="Mobile Apps, Security, Best Practices"
            className={fieldClassName}
          />
        </div>

        <div className="lg:col-span-2">
          <FeaturedImageUpload
            value={values.featuredImage}
            alt={values.featuredImageAlt}
            onImageChange={(featuredImage) =>
              updateField("featuredImage", featuredImage)
            }
            onAltChange={(featuredImageAlt) =>
              updateField("featuredImageAlt", featuredImageAlt)
            }
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl px-6"
          render={<Link href="/admin/blog" />}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-brand px-6 text-brand-foreground hover:bg-brand/90 disabled:opacity-70"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : values.status === "published"
                ? "Publish post"
                : "Save draft"}
        </Button>
      </div>
    </form>
  )
}
