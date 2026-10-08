export const PIF_ATTENDANCE_LOGIN_PATH = "/pifattendance/login"
export const PIF_ATTENDANCE_FORGOT_PASSWORD_PATH =
  "/pifattendance/forgot-password"
export const PIF_ATTENDANCE_RESET_PASSWORD_PATH =
  "/pifattendance/reset-password"
export const PIF_ATTENDANCE_ACCEPT_INVITE_PATH =
  "/pifattendance/accept-invite"
export const PIF_ATTENDANCE_HOME_PATH = "/pifattendance"

export function isPublicPifAttendanceAuthPath(path: string) {
  return (
    path === PIF_ATTENDANCE_LOGIN_PATH ||
    path.startsWith(`${PIF_ATTENDANCE_LOGIN_PATH}/`) ||
    path === PIF_ATTENDANCE_FORGOT_PASSWORD_PATH ||
    path.startsWith(`${PIF_ATTENDANCE_FORGOT_PASSWORD_PATH}/`) ||
    path === PIF_ATTENDANCE_RESET_PASSWORD_PATH ||
    path.startsWith(`${PIF_ATTENDANCE_RESET_PASSWORD_PATH}/`) ||
    path === PIF_ATTENDANCE_ACCEPT_INVITE_PATH ||
    path.startsWith(`${PIF_ATTENDANCE_ACCEPT_INVITE_PATH}/`)
  )
}

export function isPifAttendancePath(path: string) {
  return path === "/pifattendance" || path.startsWith("/pifattendance/")
}

export function getPifPasswordResetCallbackPath() {
  if (typeof window === "undefined") return null

  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const hasCallback = Boolean(
    search.get("code") ||
      search.get("token_hash") ||
      hash.get("access_token") ||
      hash.get("refresh_token") ||
      hash.get("token_hash") ||
      search.get("type") === "recovery" ||
      hash.get("type") === "recovery"
  )

  if (!hasCallback) return null
  return `${PIF_ATTENDANCE_RESET_PASSWORD_PATH}${window.location.search}${window.location.hash}`
}
