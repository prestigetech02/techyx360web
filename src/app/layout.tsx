import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConditionalSiteShell } from "@/components/layout/conditional-site-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteSchemas } from "@/components/seo/site-schemas";
import { siteMetadata } from "@/config/brand";
import { siteUrl, siteFavicon, socialShareImage } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...createPageMetadata({
    title: siteMetadata.title,
    description: siteMetadata.description,
    path: "/",
    keywords: [...siteMetadata.keywords],
    ogImage: socialShareImage,
  }),
  title: {
    default: siteMetadata.title,
    template: "%s",
  },
  icons: {
    icon: [{ url: siteFavicon, type: "image/png" }],
    apple: [{ url: siteFavicon, type: "image/png" }],
    shortcut: siteFavicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteSchemas />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalSiteShell>{children}</ConditionalSiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
