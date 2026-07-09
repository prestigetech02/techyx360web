import Link from "next/link"

export function TopBar() {
  return (
    <div className="w-full" style={{ backgroundColor: "#eaaa33" }}>
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <p className="text-center text-xs leading-snug font-medium text-[#1a1408] sm:text-sm md:text-base">
          Need an IT solution in Nigeria?{" "}
          <Link
            href="/contact"
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Let&apos;s discuss your project today.
          </Link>
        </p>
      </div>
    </div>
  )
}
