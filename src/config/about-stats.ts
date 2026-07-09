export type AboutStat = {
  id: string
  target: number
  label: string
  format: "number" | "percent" | "plus"
}

export const aboutStats: AboutStat[] = [
  {
    id: "years",
    target: 5,
    label: "Years of Experience",
    format: "plus",
  },
  {
    id: "retention",
    target: 97,
    label: "Retention Rate",
    format: "percent",
  },
  {
    id: "projects",
    target: 50,
    label: "Projects Completed",
    format: "plus",
  },
  {
    id: "students",
    target: 1000,
    label: "Students Trained",
    format: "plus",
  },
]
