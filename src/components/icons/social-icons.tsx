import { cn } from "@/lib/utils"

type SocialIconProps = {
  className?: string
}

export function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M14 8.5h2.5l-.5 3H14v9h-3.5v-9H9v-3h1.5V7.5C10.5 5 12 3.5 14.5 3.5H17v3h-2c-1 0-1 .5-1 1.5V8.5Z" />
    </svg>
  )
}

export function LinkedinIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M6.5 9.5H3.5v11h3V9.5ZM5 3.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM10 9.5h2.9v1.5h.05c.4-.75 1.4-1.55 2.9-1.55 3.1 0 3.65 2 3.65 4.6V20.5h-3v-5.6c0-1.35-.05-3.1-1.9-3.1-1.9 0-2.2 1.5-2.2 3v5.7H10V9.5Z" />
    </svg>
  )
}

export function YoutubeIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.75-1.8C17.8 5 12 5 12 5s-5.8 0-7.85.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.75 1.8C6.2 19 12 19 12 19s5.8 0 7.85-.4a2.5 2.5 0 0 0 1.75-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  )
}

export function TwitterIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M17.5 4.5h2.8l-6.1 7 7.2 9.5h-5.6l-4.4-5.7-5 5.7H3.5l6.5-7.5L3 4.5h5.7l4 5.3 4.8-5.3ZM16.4 18h1.5L7.8 6h-1.6l10.2 12Z" />
    </svg>
  )
}

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5h-9ZM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5ZM16.75 7.25a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
    </svg>
  )
}

export function TiktokIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M16.5 3c.3 2.2 1.5 3.9 3.5 4.5v3.1c-1.4 0-2.7-.4-3.8-1.1v5.9a5.9 5.9 0 1 1-5.2-5.8v3.2a2.7 2.7 0 1 0 1.9 2.6V3h3.6Z" />
    </svg>
  )
}
