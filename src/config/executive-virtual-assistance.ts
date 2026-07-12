import {
  Award,
  Briefcase,
  Building2,
  Clock,
  FolderKanban,
  Handshake,
  Headphones,
  Lightbulb,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { getCoursePath } from "@/config/training-schools"

export const evaSchoolId = "business-marketing"
export const evaCourseSlug = "executive-virtual-assistance"

export const evaCoursePath = `/trainings/executive-virtual-assistance`
export const evaRegisterPath = getCoursePath(evaSchoolId, evaCourseSlug)

export const evaShareImage = "/va.png"
export const evaShareImageAlt =
  "Executive virtual assistant professional at a modern workspace with headset and dual monitors"

export const evaHero = {
  badge: "Executive Virtual Assistance",
  title: "Work Remotely. Gain In-Demand Skills. Launch Your EVA Career.",
  description:
    "Executives everywhere need skilled virtual support — and they're paying for it. Learn the tools, workflows, and client-ready skills to build a flexible remote career in just 10 weeks.",
  image: "/vahero.png",
  imageAlt: "Techyx360 virtual assistant professional with headset and laptop",
}

export type EvaBenefit = {
  title: string
  description: string
  icon: LucideIcon
}

export const evaCareerBenefits: EvaBenefit[] = [
  {
    title: "Flexible Hours",
    description:
      "Many EVAs set their own schedules, making it easier to balance personal commitments and work responsibilities.",
    icon: Clock,
  },
  {
    title: "Long-Term Opportunity",
    description:
      "Many companies and entrepreneurs seek long-term virtual support, providing stability and ongoing work.",
    icon: ShieldCheck,
  },
  {
    title: "Decision-Making Power",
    description:
      "EVAs can often make decisions on workflow and processes, enhancing their sense of ownership and responsibility.",
    icon: Lightbulb,
  },
  {
    title: "Professional Connection",
    description:
      "Working closely with executives and various teams offers opportunities to build valuable professional relationships.",
    icon: Network,
  },
]

export const evaProgramBenefits: EvaBenefit[] = [
  {
    title: "Job Placement Assistance",
    description:
      "Get support connecting with employers and clients looking for skilled executive virtual assistants.",
    icon: Briefcase,
  },
  {
    title: "Certification",
    description:
      "Earn a recognized certificate upon completing the program successfully.",
    icon: Award,
  },
  {
    title: "Career Advancement",
    description:
      "Build skills that open doors to higher-level administrative and operations roles.",
    icon: TrendingUp,
  },
  {
    title: "Mentorship After Training",
    description:
      "Continue learning with guidance from experienced professionals after the course ends.",
    icon: Users,
  },
  {
    title: "Enhanced Technical Proficiency",
    description:
      "Master the digital tools and workflows used by modern remote teams and executives.",
    icon: Wrench,
  },
  {
    title: "And Many More",
    description:
      "Gain communication, organization, and client management skills that keep you competitive.",
    icon: Sparkles,
  },
]

export const evaFaqs = [
  {
    question: "What is the duration of the course?",
    answer:
      "The course is a 10-week program with three sessions per week.",
  },
  {
    question: "What are the prerequisites for taking the course?",
    answer:
      "No prior experience is required. However, basic computer skills and a strong work ethic are beneficial.",
  },
  {
    question:
      "Can I take the course if I have no prior experience in administration or office management?",
    answer:
      "Absolutely! The course is designed to be accessible to individuals with a variety of backgrounds. We provide comprehensive training to equip you with the necessary skills to succeed as an executive virtual assistant.",
  },
  {
    question: "What are the job prospects for Executive Virtual Assistants?",
    answer:
      "The demand for skilled executive virtual assistants is steadily increasing. With the rise of remote work and the need for efficient administrative support, there are ample opportunities available in various industries.",
  },
  {
    question: "What technology or tools do I need to complete the course?",
    answer:
      "We will provide a detailed list of recommended tools that you'll need to access the course and complete the training. Most of these tools are readily available.",
  },
]

export type EvaJobRole = {
  title: string
  description: string
  icon: LucideIcon
}

export const evaJobRoles: EvaJobRole[] = [
  {
    title: "Remote Project Assistant",
    description:
      "Provide vital support to project managers and teams by handling various administrative project tasks remotely.",
    icon: FolderKanban,
  },
  {
    title: "Virtual Office Manager",
    description:
      "Manage administrative functions remotely and ensure the efficiency of day-to-day business operations.",
    icon: Building2,
  },
  {
    title: "Business Networking Coordinator",
    description:
      "Plan and coordinate networking events and activities among business professionals.",
    icon: Handshake,
  },
  {
    title: "Freelance Consultant",
    description:
      "Offer professional advisory and operational support to busy executives in relation to their business.",
    icon: Briefcase,
  },
  {
    title: "Customer Support Officer",
    description:
      "Help businesses attend to customer enquiries and complaints virtually as a trained executive virtual assistant.",
    icon: Headphones,
  },
]

export const evaAdditionalRoles =
  "Other roles our graduates as an EVA can fit into include Research Analyst, Project Manager, Product Manager, Customer Success Associate, and many more."

export const evaPricing = {
  currentPrice: "₦50,000",
  regularPrice: "₦180,000",
  description:
    "A one-time fee for the complete 10-week Executive Virtual Assistance program.",
}

export const evaInvestmentIncludes = [
  "10-Week Live Training (3 sessions/week)",
  "Administrative & Remote Work Skills",
  "Productivity Tools & Workflow Training",
  "Job Placement Assistance",
  "EVA Certification",
  "Post-Training Mentorship",
  "Career Advancement Support",
]

export const evaRelatedPrograms = [
  {
    label: "Individual Certifications",
    href: "/trainings/individual-certifications",
    description: "Browse all professional certification programs",
  },
  {
    label: "Product Innovation Fellowship",
    href: "/trainings/product-innovation-fellowship",
    description: "12-week fellowship for product and tech careers",
  },
  {
    label: "Tech Bootcamps",
    href: "/trainings/bootcamps",
    description: "Short intensive programs for fast skill building",
  },
  {
    label: "Corporate Training",
    href: "/trainings/corporate",
    description: "Tailored tech training for teams and organizations",
  },
  {
    label: "Register for Training",
    href: "/trainings/register",
    description: "Browse schools and enroll in Techyx360 programs",
  },
  {
    label: "Tech Trainings Service",
    href: "/services/tech-trainings",
    description: "Hands-on training solutions for learners and businesses",
  },
]
