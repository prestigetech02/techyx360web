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

export const evaHero = {
  badge: "Executive Virtual Assistance",
  title: "Become a Virtual Assistant",
  description:
    "With the increasing demand for virtual assistance, now is the perfect time to launch your new venture while you automate processes for busy executives.",
  image:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=80",
  imageAlt: "Executive virtual assistant working remotely",
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
