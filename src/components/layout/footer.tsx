import Image from "next/image"
import Link from "next/link"
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  TwitterIcon,
} from "@/components/icons/social-icons"
import { WhatsAppIcon } from "@/components/icons/contact-icons"
import { brand } from "@/config/brand"
import {
  footerBottomLinks,
  footerCompanyLinks,
  footerContactInfo,
  footerDescription,
  footerServiceLinks,
  footerSocialIcons,
} from "@/config/footer"
import { cn } from "@/lib/utils"

const footerLinkClass =
  "text-sm text-slate-400 transition-colors hover:text-[#eaaa33]"

const socialIconMap = {
  Facebook: FacebookIcon,
  X: TwitterIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
  TikTok: TiktokIcon,
} as const

const contactIconMap = {
  address: MapPinIcon,
  phone: PhoneIcon,
  email: MailIcon,
  whatsapp: WhatsAppIcon,
  hours: ClockIcon,
} as const

type FooterColumnProps = {
  title: string
  children: React.ReactNode
  className?: string
}

function FooterColumn({ title, children, className }: FooterColumnProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

type FooterLinkListProps = {
  links: readonly { label: string; href: string }[]
}

function FooterLinkList({ links }: FooterLinkListProps) {
  return (
    <ul className="mt-5 space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className={footerLinkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function FooterContactList() {
  return (
    <ul className="mt-5 space-y-4">
      {footerContactInfo.map((item) => {
        const Icon = contactIconMap[item.id]
        const content = (
          <>
            <Icon
              className="size-5 shrink-0 text-[#eaaa33]"
              aria-hidden
            />
            <span className="text-sm leading-relaxed text-slate-400">
              {item.text}
            </span>
          </>
        )

        return (
          <li key={item.id}>
            {"href" in item ? (
              <a
                href={item.href}
                className="flex items-start gap-3 transition-colors hover:[&_span]:text-[#eaaa33]"
                {...(item.id === "whatsapp"
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {content}
              </a>
            ) : (
              <div className="flex items-start gap-3">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-[#0b1120] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.65fr_0.85fr_0.85fr_1.15fr] lg:gap-x-10 xl:gap-x-12">
          <div className="min-w-0 lg:pr-4">
            <Link href="/" className="inline-flex shrink-0 items-center">
              <Image
                src={brand.logo.dark}
                alt={`${brand.name} — ${brand.tagline}`}
                width={240}
                height={60}
                className="h-12 w-auto sm:h-14"
              />
              <span className="sr-only">{brand.name}</span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400 lg:max-w-md xl:max-w-lg">
              {footerDescription}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {footerSocialIcons.map((social) => {
                const Icon = socialIconMap[social.label]

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="size-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          <FooterColumn title="Company">
            <FooterLinkList links={footerCompanyLinks} />
          </FooterColumn>

          <FooterColumn title="Services">
            <FooterLinkList links={footerServiceLinks} />
          </FooterColumn>

          <FooterColumn title="Contact Info">
            <FooterContactList />
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-sm text-slate-500">
            Copyright {year}. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            {footerBottomLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={footerLinkClass}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
