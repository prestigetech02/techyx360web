import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Home, Search } from "lucide-react"

import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { buttonVariants } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: `Page Not Found | ${brand.name}`,
  robots: {
    index: false,
    follow: true,
  },
}

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services/web-development" },
  { label: "Trainings", href: "/trainings/register" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeroBanner title="Page not found">
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          The page you are looking for may have been moved, renamed, or no longer
          exists.
        </p>
      </PageHeroBanner>

      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-6xl font-bold tracking-tight text-brand sm:text-7xl">
            404
          </p>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            We can&apos;t find that page
          </h2>

          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Let&apos;s get you back on track. Head to the homepage or explore one
            of the sections below.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 gap-2 rounded-xl bg-brand px-6 text-brand-foreground hover:bg-brand/90"
              )}
            >
              <Home className="size-4" aria-hidden />
              Back to homepage
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 gap-2 rounded-xl px-6"
              )}
            >
              <Search className="size-4" aria-hidden />
              Contact support
            </Link>
          </div>

          <div className="mt-12 border-t border-border/60 pt-8">
            <p className="text-sm font-semibold text-foreground">
              Popular pages
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
