import type { Metadata } from "next"
import Link from "next/link"

import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { brand, siteMetadata } from "@/config/brand"
import { organization } from "@/config/site"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Privacy Policy | ${brand.name}`,
  description:
    "Learn how Techyx360 collects, uses, and protects your personal information when you use our website and services.",
  path: "/privacy-policy",
  keywords: ["privacy policy", "data protection", ...siteMetadata.keywords.slice(0, 3)],
})

const lastUpdated = "July 2026"

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: [
      "We collect information you provide directly to us, such as your name, email address, phone number, and message when you fill out a contact form, register for a training program, or request a service.",
      "We also automatically collect certain technical information when you visit our website, including your IP address, browser type, device information, and pages visited, through cookies and similar technologies.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    list: [
      "Respond to your enquiries and provide the services you request.",
      "Process training and course registrations.",
      "Improve our website, services, and customer experience.",
      "Send you relevant updates, where you have agreed to receive them.",
      "Comply with legal and regulatory obligations.",
    ],
  },
  {
    id: "sharing-information",
    title: "Sharing Your Information",
    body: [
      "We do not sell your personal information. We may share it with trusted service providers who help us operate our website and deliver our services, and only to the extent necessary for those purposes.",
      "We may also disclose information where required by law or to protect our rights, users, and the public.",
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    body: [
      "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, or misuse. However, no method of transmission over the internet is completely secure.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "Our website uses cookies to enhance your browsing experience and analyze site traffic. You can control or disable cookies through your browser settings, though some features may not function properly as a result.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: [
      "You have the right to access, correct, or request deletion of your personal information. To exercise these rights, please contact us using the details below.",
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeroBanner title="Privacy Policy">
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          How {organization.name} collects, uses, and protects your information.
        </p>
      </PageHeroBanner>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            This Privacy Policy explains how {organization.name} (&quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;) handles the personal information
            you share with us through our website and services. By using our
            website, you agree to the practices described below.
          </p>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {section.title}
                </h2>

                {section.body?.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mt-4 text-base leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.list ? (
                  <ul className="mt-4 space-y-2 pl-1">
                    {section.list.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            <div id="contact" className="scroll-mt-28">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Contact Us
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                If you have any questions about this Privacy Policy or how we
                handle your data, please reach out:
              </p>
              <ul className="mt-4 space-y-2 text-base text-muted-foreground">
                <li>
                  Email:{" "}
                  <a
                    href={`mailto:${organization.email}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {organization.email}
                  </a>
                </li>
                <li>
                  Address: {organization.address.streetAddress},{" "}
                  {organization.address.addressLocality},{" "}
                  {organization.address.addressRegion}, Nigeria.
                </li>
              </ul>

              <p className="mt-8 text-sm text-muted-foreground">
                Return to the{" "}
                <Link href="/" className="font-medium text-brand hover:underline">
                  homepage
                </Link>{" "}
                or{" "}
                <Link
                  href="/contact"
                  className="font-medium text-brand hover:underline"
                >
                  contact our team
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
