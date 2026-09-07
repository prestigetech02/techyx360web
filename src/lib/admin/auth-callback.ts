export const ADMIN_RESET_PASSWORD_PATH = "/admin/reset-password"
export const ADMIN_FORGOT_PASSWORD_PATH = "/admin/forgot-password"
export const ADMIN_ACCEPT_INVITE_PATH = "/admin/accept-invite"

export function isPublicAdminAuthPath(path: string) {
  return (
    path === "/admin/login" ||
    path.startsWith("/admin/login/") ||
    path === ADMIN_ACCEPT_INVITE_PATH ||
    path.startsWith(`${ADMIN_ACCEPT_INVITE_PATH}/`) ||
    path === ADMIN_FORGOT_PASSWORD_PATH ||
    path.startsWith(`${ADMIN_FORGOT_PASSWORD_PATH}/`) ||
    path === ADMIN_RESET_PASSWORD_PATH ||
    path.startsWith(`${ADMIN_RESET_PASSWORD_PATH}/`) ||
    path === "/auth" ||
    path.startsWith("/auth/")
  )
}

export function getPasswordResetCallbackPath() {
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
  return `${ADMIN_RESET_PASSWORD_PATH}${window.location.search}${window.location.hash}`
}
