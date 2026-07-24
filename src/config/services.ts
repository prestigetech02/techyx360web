import {
  Code2,
  Globe,
  Megaphone,
  GraduationCap,
  Settings2,
  Smartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

export type Service = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export const services: Service[] = [
  {
    title: "Mobile App Development",
    description:
      "Custom iOS and Android apps for Nigerian businesses, banks, and startups—built for performance, security, and growth.",
    href: "/services/mobile-app-development",
    icon: Smartphone,
  },
  {
    title: "Web Development",
    description:
      "Fast, SEO-ready websites and web platforms for companies in Lagos, Abuja, and across Nigeria that convert visitors into customers.",
    href: "/services/web-development",
    icon: Globe,
  },
  {
    title: "Custom Software Solution",
    description:
      "Bespoke software and business systems that automate operations, cut costs, and support scalable growth in Nigerian enterprises.",
    href: "/services/custom-software",
    icon: Code2,
  },
  {
    title: "Tech Trainings",
    description:
      "Practical tech training for Nigerian teams and individuals covering software tools, digital skills, and industry-ready workflows.",
    href: "/services/tech-trainings",
    icon: GraduationCap,
  },
  {
    title: "Digital Marketing",
    description:
      "Result-driven digital marketing for Nigerian brands—SEO, social ads, and content strategies that increase visibility and sales.",
    href: "/services/digital-marketing",
    icon: Megaphone,
  },
  {
    title: "Technical Consultancy",
    description:
      "Expert IT consulting in Nigeria for technology roadmaps, infrastructure planning, and secure digital transformation.",
    href: "/services/technical-consultancy",
    icon: Settings2,
  },
  {
    title: "Talent Outsourcing",
    description:
      "Vetted developers, designers, and tech specialists embedded in your team—flexible staffing that scales with your projects.",
    href: "/services/talent-outsourcing",
    icon: UsersRound,
  },
]
