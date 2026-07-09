"use client"

import { SearchIcon } from "lucide-react"

import { SiteSearchInput } from "@/components/layout/site-search-input"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function SearchDialog({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "touch-manipulation min-h-11 min-w-11 text-foreground hover:bg-muted active:bg-muted/80",
          className
        )}
        aria-label="Open search"
      >
        <SearchIcon className="size-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <SiteSearchInput autoFocus />
      </DialogContent>
    </Dialog>
  )
}
