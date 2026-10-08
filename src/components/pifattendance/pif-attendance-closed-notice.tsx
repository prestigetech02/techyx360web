"use client"

import Image from "next/image"
import Link from "next/link"

import { brand } from "@/config/brand"

export function PifAttendanceClosedNotice() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <Link href="/" className="inline-flex">
            <Image
              src={brand.logo.light}
              alt={brand.name}
              width={160}
              height={40}
              priority
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src={brand.logo.dark}
              alt={brand.name}
              width={160}
              height={40}
              priority
              className="hidden h-8 w-auto dark:block"
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-[20rem] text-center sm:max-w-sm">
          <Image
            src="/images/pif/attendance-closed.png"
            alt="Closed"
            width={160}
            height={120}
            priority
            className="mx-auto h-auto w-24 sm:w-28"
          />
          <h1 className="mt-4 text-base leading-snug font-semibold tracking-tight text-balance text-foreground sm:mt-5 sm:text-xl sm:leading-tight">
            Attendance is closed at the moment, Please come back later
          </h1>
        </div>
      </main>

      <footer className="border-t border-border/60 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-xs text-muted-foreground">
          For Product Innovation Fellowship fellows only.
        </p>
      </footer>
    </div>
  )
}
