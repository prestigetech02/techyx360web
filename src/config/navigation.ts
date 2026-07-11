export type NavItem = {
  label: string
  href?: string
  children?: { label: string; href: string; description?: string }[]
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Services",
    children: [
      {
        label: "Mobile App Development",
        href: "/services/mobile-app-development",
        description: "iOS & Android apps for Nigerian businesses",
      },
      {
        label: "Web Development",
        href: "/services/web-development",
        description: "SEO-ready websites and platforms for growing businesses",
      },
      {
        label: "Custom Software Solution",
        href: "/services/custom-software",
        description: "Bespoke software for Nigerian enterprises",
      },
      {
        label: "Tech Trainings",
        href: "/services/tech-trainings",
        description: "Hands-on tech skills training for teams and learners",
      },
      {
        label: "Digital Marketing",
        href: "/services/digital-marketing",
        description: "SEO & ads that grow Nigerian brands",
      },
      {
        label: "Technical Consultancy",
        href: "/services/technical-consultancy",
        description: "IT consulting & digital transformation",
      },
    ],
  },
  {
    label: "Trainings",
    children: [
      {
        label: "Corporate",
        href: "/trainings/corporate",
        description: "Custom tech training programs for teams and organizations",
      },
      {
        label: "SIWES / IT",
        href: "/trainings/siwes-it",
        description: "Structured SIWES and IT placement training for students",
      },
      {
        label: "Individual Certifications",
        href: "/trainings/individual-certifications",
        description: "Professional certification prep for individuals",
      },
      {
        label: "Bootcamps",
        href: "/trainings/bootcamps",
        description: "Intensive hands-on bootcamps for in-demand tech skills",
      },
      {
        label: "Product Innovation Fellowship",
        href: "/trainings/product-innovation-fellowship",
        description:
          "Fellowship program for building and launching innovative products",
      },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]
