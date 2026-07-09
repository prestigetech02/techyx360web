"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const labelClassName = "mb-2 block text-sm font-medium text-foreground"

type FeaturedImageUploadProps = {
  id?: string
  value: string
  alt: string
  onImageChange: (url: string) => void
  onAltChange: (alt: string) => void
}

export function FeaturedImageUpload({
  id = "blog-featured-image",
  value,
  alt,
  onImageChange,
  onAltChange,
}: FeaturedImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = async (file: File | null) => {
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/blog-images", {
        method: "POST",
        body: formData,
      })

      const result = (await response.json()) as {
        error?: string
        url?: string
      }

      if (!response.ok || !result.url) {
        const message = result.error ?? "Unable to upload image right now."
        setUploadError(message)
        notify.error(message)
        return
      }

      onImageChange(result.url)

      if (!alt.trim()) {
        const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
        onAltChange(baseName)
      }

      notify.success("Featured image uploaded.")
    } catch {
      const message = "Unable to upload image right now. Please try again."
      setUploadError(message)
      notify.error(message)
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={id} className={labelClassName}>
          Featured image
        </label>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(event) => {
            void handleFileSelect(event.target.files?.[0] ?? null)
          }}
        />

        {value ? (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
            <div className="relative aspect-[16/9] w-full bg-muted">
              <Image
                src={value}
                alt={alt || "Featured image preview"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
                unoptimized={value.startsWith("blob:")}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                {value}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg"
                >
                  {isUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => onImageChange("")}
                  className="rounded-lg text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center transition-colors",
              "hover:border-brand/60 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-70"
            )}
          >
            {isUploading ? (
              <Loader2 className="size-8 animate-spin text-brand" />
            ) : (
              <ImagePlus className="size-8 text-brand" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {isUploading ? "Uploading image..." : "Upload featured image"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP, or GIF up to 5 MB
              </p>
            </div>
          </button>
        )}

        {uploadError ? (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${id}-alt`} className={labelClassName}>
          Featured image alt text
        </label>
        <input
          id={`${id}-alt`}
          name="featuredImageAlt"
          type="text"
          required
          value={alt}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Describe the featured image"
          className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm md:text-sm"
        />
      </div>
    </div>
  )
}
