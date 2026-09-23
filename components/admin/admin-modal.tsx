"use client"

import { X } from "lucide-react"
import { createContext, useContext, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// True when the current subtree is rendered inside a native <dialog>. RowTable
// reads this to avoid opening a dialog inside a dialog (it expands inline
// instead). See the "never a dialog inside a dialog" rule.
const InDialogContext = createContext(false)

export function useInDialog(): boolean {
  return useContext(InDialogContext)
}

function useDialogElement(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [onClose])

  return ref
}

// Dialogs render inside a section's <form>, so a stray Enter would submit/publish
// the whole draft. Swallow Enter on inputs (textareas keep it for newlines).
function swallowEnter(event: React.KeyboardEvent) {
  const target = event.target as HTMLElement
  if (event.key === "Enter" && target.tagName === "INPUT") {
    event.preventDefault()
  }
}

const dialogClass =
  "m-auto w-[calc(100%-2rem)] rounded-lg border border-border bg-card p-0 text-card-foreground backdrop:bg-black/70"

export function AdminModal({
  open,
  onClose,
  title,
  closeLabel,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  className?: string
  children: React.ReactNode
}) {
  const ref = useDialogElement(open, onClose)

  return (
    <dialog
      ref={ref}
      onKeyDown={swallowEnter}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className={cn(dialogClass, "max-w-2xl", className)}
    >
      <InDialogContext.Provider value={true}>
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X />
          </Button>
        </header>
        {/* No save button — the editor mutates the draft in place; the section
            header publishes. */}
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </InDialogContext.Provider>
    </dialog>
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
}) {
  const ref = useDialogElement(open, onClose)

  return (
    <dialog
      ref={ref}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className={cn(dialogClass, "max-w-sm")}
    >
      <div className="p-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
