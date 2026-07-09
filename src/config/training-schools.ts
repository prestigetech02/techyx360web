import {
  Bot,
  ClipboardList,
  Code2,
  Database,
  Globe,
  Headset,
  Layers,
  Megaphone,
  Monitor,
  Palette,
  type LucideIcon,
} from "lucide-react"

export type TrainingCourse = {
  slug: string
  title: string
  description: string
  duration: string
  icon: LucideIcon
  detailPath?: string
}

export type TrainingSchool = {
  id: string
  name: string
  description: string
  image: string
  imageAlt: string
  courses: TrainingCourse[]
}

export function getCourseKey(schoolId: string, course: TrainingCourse | string) {
  const slug = typeof course === "string" ? course : course.slug
  return `${schoolId}/${slug}`
}

export function getCoursePath(schoolId: string, course: TrainingCourse | string) {
  return `/trainings/register/${getCourseKey(schoolId, course)}`
}

export function parseCourseKeyFromPath(pathname: string) {
  const prefix = "/trainings/register/"
  if (!pathname.startsWith(prefix)) return null

  const remainder = pathname.slice(prefix.length).replace(/\/$/, "")
  if (!remainder) return null

  const [schoolId, courseSlug] = remainder.split("/")
  if (!schoolId || !courseSlug) return null

  return getCourseKey(schoolId, courseSlug)
}

function findCourseInSchool(school: TrainingSchool, courseRef: string) {
  return (
    school.courses.find((item) => item.slug === courseRef) ??
    school.courses.find((item) => item.title === courseRef) ??
    null
  )
}

export function findCourseBySlug(slug: string) {
  for (const school of trainingSchools) {
    const course = school.courses.find((item) => item.slug === slug)
    if (course) {
      return { school, course }
    }
  }

  return null
}

export function findCourseByKey(key: string) {
  if (key.includes(":")) {
    const [schoolId, courseRef] = key.split(":")
    const school = trainingSchools.find((item) => item.id === schoolId)
    if (!school) return null

    const course = findCourseInSchool(school, courseRef)
    return course ? { school, course } : null
  }

  const [schoolId, courseSlug] = key.split("/")
  const school = trainingSchools.find((item) => item.id === schoolId)
  if (!school) return null

  const course = school.courses.find((item) => item.slug === courseSlug)
  return course ? { school, course } : null
}

export function getAllCourseRegistrationPaths() {
  return trainingSchools.flatMap((school) =>
    school.courses.map((course) => getCoursePath(school.id, course))
  )
}

export const defaultTrainingSchoolId = "product"

export function getDefaultCourseKey() {
  const school =
    trainingSchools.find((item) => item.id === defaultTrainingSchoolId) ??
    trainingSchools[0]

  return getCourseKey(school.id, school.courses[0])
}

export const trainingSchools: TrainingSchool[] = [
  {
    id: "product",
    name: "School of Product",
    description: "Build and market digital products that solve real problems.",
    image:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Product design and management training",
    courses: [
      {
        slug: "product-design-ui-ux",
        title: "Product Design (UI/UX)",
        description:
          "Learn user research, wireframing, prototyping, and interface design.",
        duration: "3 Months",
        icon: Palette,
      },
      {
        slug: "product-management",
        title: "Product Management",
        description:
          "Learn how to manage product lifecycles, teams, and stakeholder expectations.",
        duration: "3 Months",
        icon: ClipboardList,
      },
      {
        slug: "product-marketing",
        title: "Product Marketing",
        description:
          "Develop strategies for launching, positioning, and growing digital products.",
        duration: "3 Months",
        icon: Megaphone,
      },
    ],
  },
  {
    id: "software-engineering",
    name: "School of Software Engineering",
    description:
      "Master the skills needed to build websites, applications, and digital products.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Software engineering training workspace",
    courses: [
      {
        slug: "frontend-development",
        title: "Frontend Development",
        description:
          "Learn HTML, CSS, JavaScript, React, and modern frontend tools.",
        duration: "3 Months",
        icon: Monitor,
      },
      {
        slug: "backend-development",
        title: "Backend Development",
        description:
          "Build powerful APIs, databases, and server-side applications.",
        duration: "3 Months",
        icon: Database,
      },
      {
        slug: "wordpress-website-development",
        title: "WordPress Website Development",
        description:
          "Create professional business and e-commerce websites with WordPress.",
        duration: "3 Months",
        icon: Globe,
      },
      {
        slug: "full-stack-development",
        title: "Full Stack Development",
        description:
          "Become a complete developer by mastering both frontend and backend technologies.",
        duration: "4 Months",
        icon: Layers,
      },
    ],
  },
  {
    id: "business-marketing",
    name: "School of Business & Marketing",
    description:
      "Acquire practical business skills that drive growth and productivity.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Business and digital marketing training",
    courses: [
      {
        slug: "digital-marketing",
        title: "Digital Marketing",
        description:
          "Master SEO, social media marketing, email marketing, and paid advertising.",
        duration: "10 Weeks",
        icon: Megaphone,
      },
      {
        slug: "executive-virtual-assistance",
        title: "Executive Virtual Assistance",
        description:
          "Learn administrative support, communication, scheduling, and productivity tools.",
        duration: "10 Weeks",
        icon: Headset,
        detailPath: "/trainings/executive-virtual-assistance",
      },
      {
        slug: "ai-workflow-automation",
        title: "AI & Workflow Automation",
        description:
          "Leverage AI tools and automation platforms to improve productivity and business efficiency.",
        duration: "6 Weeks",
        icon: Bot,
      },
    ],
  },
]
