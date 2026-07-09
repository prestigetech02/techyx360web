import { services } from "@/config/services"

export const footerDescription =
  "Techyx360 is a trusted IT solutions company in Nigeria, delivering custom software, web and mobile app development, IT consulting, and digital marketing for businesses across Africa."

export const footerCompanyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/services/web-development" },
  { label: "Trainings", href: "/trainings/register" },
  { label: "News", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const

export const footerServiceLinks = services.map((service) => ({
  label: service.title,
  href: service.href,
}))

export const footerContactInfo = [
  {
    id: "address",
    text: "8, Road B, Ladugba Estate, Ita Oluwo, Ikorodu, Lagos, Nigeria.",
  },
  {
    id: "phone",
    text: "(+234)9071682117, (+234)9128868892",
    href: "tel:+2349071682117",
  },
  {
    id: "email",
    text: "info@techyx360.com",
    href: "mailto:info@techyx360.com",
  },
  {
    id: "whatsapp",
    text: "(+234)9128868892",
    href: "https://wa.me/2349128868892",
  },
  {
    id: "hours",
    text: "08:00AM - 06:00PM",
  },
] as const

export const footerSocialIcons = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/155zNBkRMJ/",
  },
  {
    label: "X",
    href: "https://x.com/techyX360?t=9KqBoa87pASHdW0dAFqM9A&s=09",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/techyx360/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/techyx_360?igsh=ZW1pdHV3Nmo0OGJx",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@techyx360ltd",
  },
] as const

export const footerBottomLinks = [
  { label: "About Company", href: "/about" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Blog", href: "/blog" },
] as const
