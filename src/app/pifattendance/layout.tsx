import { PifForceLightTheme } from "@/components/pifattendance/pif-force-light-theme"

export default function PifAttendanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PifForceLightTheme>{children}</PifForceLightTheme>
}
