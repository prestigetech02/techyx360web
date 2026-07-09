import { isHtmlContent } from "@/lib/blog/content"
import { cn } from "@/lib/utils"

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return part
  })
}

function MarkdownBlogContent({ content }: { content: string }) {
  const blocks = content.split("\n\n").filter(Boolean)

  return (
    <>
      {blocks.map((block, index) => {
        const trimmed = block.trim()

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={index}
              id={trimmed.slice(3).toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-28 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              {trimmed.slice(3)}
            </h2>
          )
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {trimmed.slice(4)}
            </h3>
          )
        }

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((line) => line.startsWith("- "))

          return (
            <ul key={index} className="space-y-2 pl-1">
              {items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <span>{renderInline(item.slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p
            key={index}
            className={cn(
              "text-base leading-[1.85] text-muted-foreground sm:text-[1.05rem]"
            )}
          >
            {renderInline(trimmed)}
          </p>
        )
      })}
    </>
  )
}

export function BlogPostContent({ content }: { content: string }) {
  if (isHtmlContent(content)) {
    return (
      <div
        className="blog-content blog-content-html"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="blog-content space-y-6">
      <MarkdownBlogContent content={content} />
    </div>
  )
}
