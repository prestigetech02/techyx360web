import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { contactPageCards } from "@/config/contact"
import { cn } from "@/lib/utils"

const iconMap = {
  location: MapPinIcon,
  email: MailIcon,
  phone: PhoneIcon,
} as const

type ContactInfoCardProps = {
  id: keyof typeof iconMap
  title: string
  description: string
  link?: {
    label: string
    href: string
  }
}

function ContactInfoCard({
  id,
  title,
  description,
  link,
}: ContactInfoCardProps) {
  const Icon = iconMap[id]

  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand/15 bg-brand/10 text-brand">
          <Icon className="size-5" aria-hidden />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {link ? (
            <Link
              href={link.href}
              className="mt-2 inline-block text-sm font-medium text-brand transition-colors hover:text-[#eaaa33]"
            >
              {link.label}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function ContactInfoCards({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {contactPageCards.map((card) => (
        <ContactInfoCard key={card.id} {...card} />
      ))}
    </div>
  )
}
