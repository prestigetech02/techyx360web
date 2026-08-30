import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  // Ensure Chromium binaries are included in serverless PDF routes on Vercel.
  outputFileTracingIncludes: {
    "/api/admin/invoices/[id]/pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/api/admin/invoices/[id]/email": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/api/admin/payroll/items/[id]/payslip": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
  // Allow LAN devices (e.g. phone on Wi-Fi) to load dev client bundles / HMR.
  // Add your phone's LAN IP if it changes.
  allowedDevOrigins: ["192.168.9.217"],
  async redirects() {
    return [
      {
        source: "/executive-virtual-assitance-course",
        destination: "/trainings/executive-virtual-assistance",
        permanent: true,
      },
      {
        source: "/executive-virtual-assitance-course/",
        destination: "/trainings/executive-virtual-assistance",
        permanent: true,
      },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
