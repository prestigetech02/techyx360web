"use client"

import { SearchIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles, services, portfolio..."
            className="pl-9"
            autoFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
