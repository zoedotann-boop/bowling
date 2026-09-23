"use client"

import { Switch } from "@base-ui/react/switch"
import type * as React from "react"

import { cn } from "@/lib/utils"

import { InfoTooltip } from "./info-tooltip"

// Dense, tool-like primitives shared by every admin page. Sizing lives here so
// tweaking one control moves every page together (never override per page).

export function AdminCard({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 text-card-foreground",
        className
      )}
    >
      {(title || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function AdminField({
  label,
  tooltip,
  htmlFor,
  children,
  className,
}: {
  label: string
  tooltip?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      {children}
    </div>
  )
}

const controlClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"

export function AdminInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />
}

export function AdminTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClass, "h-auto min-h-20 py-2", className)}
      {...props}
    />
  )
}

export function AdminSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select className={cn(controlClass, "pe-8", className)} {...props}>
      {children}
    </select>
  )
}

function AdminToggle({
  checked,
  onCheckedChange,
  id,
  disabled,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
}) {
  return (
    <Switch.Root
      id={id}
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next)}
      disabled={disabled}
      className="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-input bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40 data-[checked]:bg-primary"
    >
      <Switch.Thumb className="ms-0.5 size-4 rounded-full bg-foreground transition-transform data-[checked]:translate-x-4 rtl:data-[checked]:-translate-x-4" />
    </Switch.Root>
  )
}

// A labeled boolean row (toggle + label + optional description).
export function AdminFlag({
  label,
  description,
  checked,
  onCheckedChange,
  id,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
      <label htmlFor={id} className="text-sm">
        <span className="font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </label>
      <AdminToggle
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}
