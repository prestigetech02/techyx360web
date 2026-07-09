export type AboutStat = {
  id: string
  target: number
  label: string
  format: "number" | "percent" | "k"
}

export const aboutStats: AboutStat[] = [
  {
    id: "years",
    target: 25,
    label: "Years Experience",
    format: "number",
  },
  {
    id: "retention",
    target: 97,
    label: "Retention Rate",
    format: "percent",
  },
  {
    id: "projects",
    target: 8000,
    label: "Project Completed",
    format: "k",
  },
  {
    id: "clients",
    target: 19000,
    label: "Happy Clients",
    format: "k",
  },
]

