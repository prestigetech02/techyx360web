"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const triggerClassName =
  "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-background px-3.5 text-left text-sm text-foreground transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"

function Dropdown({ ...props }: SelectPrimitive.Root.Props<string, false>) {
  return <SelectPrimitive.Root data-slot="dropdown" {...props} />
}

function DropdownTrigger({
  className,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="dropdown-trigger"
      className={cn(triggerClassName, className)}
      {...props}
    />
  )
}

function DropdownValue({
  className,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="dropdown-value"
      className={cn(
        "min-w-0 flex-1 truncate data-placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownIcon({ className }: { className?: string }) {
  return (
    <SelectPrimitive.Icon
      data-slot="dropdown-icon"
      className={cn(
        "pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200 data-popup-open:rotate-180",
        className
      )}
    >
      <ChevronDownIcon className="size-4" aria-hidden />
    </SelectPrimitive.Icon>
  )
}

function DropdownContent({
  className,
  children,
  sideOffset = 4,
  ...props
}: SelectPrimitive.Positioner.Props & {
  children: React.ReactNode
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        data-slot="dropdown-positioner"
        sideOffset={sideOffset}
        alignItemWithTrigger={false}
        className="z-[100] outline-none"
        {...props}
      >
        <SelectPrimitive.Popup
          data-slot="dropdown-content"
          className={cn(
            "max-h-64 min-w-(--anchor-width) overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
        >
          <SelectPrimitive.List
            data-slot="dropdown-list"
            className="max-h-60 overflow-y-auto p-1 outline-none"
          >
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function DropdownItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="dropdown-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-lg py-2.5 pr-8 pl-3 text-sm outline-none select-none",
        "text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-highlighted:bg-muted data-highlighted:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.ItemIndicator
        data-slot="dropdown-item-indicator"
        className="absolute right-2 flex size-4 items-center justify-center text-brand"
      >
        <CheckIcon className="size-4" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function DropdownItemText({
  className,
  ...props
}: SelectPrimitive.ItemText.Props) {
  return (
    <SelectPrimitive.ItemText
      data-slot="dropdown-item-text"
      className={cn("truncate", className)}
      {...props}
    />
  )
}

function DropdownGroup({
  className,
  ...props
}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="dropdown-group"
      className={cn("p-1", className)}
      {...props}
    />
  )
}

function DropdownGroupLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="dropdown-group-label"
      className={cn(
        "px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

export type DropdownOption = {
  value: string
  label: string
  disabled?: boolean
}

export type DropdownOptionGroup = {
  label: string
  options: DropdownOption[]
}

type DropdownFieldProps = {
  id?: string
  name?: string
  placeholder?: string
  options?: DropdownOption[]
  groups?: DropdownOptionGroup[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  disabled?: boolean
  required?: boolean
  className?: string
  modal?: boolean
}

function DropdownField({
  id,
  name,
  placeholder = "Select an option",
  options = [],
  groups,
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  className,
  modal = false,
}: DropdownFieldProps) {
  const items = React.useMemo(() => {
    if (groups?.length) {
      return groups.map((group) => ({
        value: group.label,
        items: group.options.map((option) => ({
          value: option.value,
          label: option.label,
          disabled: option.disabled,
        })),
      }))
    }

    return options.map((option) => ({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
    }))
  }, [groups, options])

  return (
    <Dropdown
      name={name}
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
      modal={modal}
    >
      <DropdownTrigger id={id} className={className}>
        <DropdownValue placeholder={placeholder} />
        <DropdownIcon />
      </DropdownTrigger>

      <DropdownContent>
        {groups?.length
          ? groups.map((group) => (
              <DropdownGroup key={group.label}>
                <DropdownGroupLabel>{group.label}</DropdownGroupLabel>
                {group.options.map((option) => (
                  <DropdownItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    label={option.label}
                  >
                    <DropdownItemText>{option.label}</DropdownItemText>
                  </DropdownItem>
                ))}
              </DropdownGroup>
            ))
          : options.map((option) => (
              <DropdownItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                label={option.label}
              >
                <DropdownItemText>{option.label}</DropdownItemText>
              </DropdownItem>
            ))}
      </DropdownContent>
    </Dropdown>
  )
}

export {
  Dropdown,
  DropdownContent,
  DropdownField,
  DropdownGroup,
  DropdownGroupLabel,
  DropdownIcon,
  DropdownItem,
  DropdownItemText,
  DropdownTrigger,
  DropdownValue,
}
