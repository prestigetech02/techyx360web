import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
