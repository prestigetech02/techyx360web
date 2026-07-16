"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { formatAmountInput } from "@/lib/money"
import { cn } from "@/lib/utils"

type CurrencyInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string
  onValueChange: (value: string) => void
}

function CurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: CurrencyInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(event) => onValueChange(formatAmountInput(event.target.value))}
      className={cn("tabular-nums", className)}
      {...props}
    />
  )
}

export { CurrencyInput }
