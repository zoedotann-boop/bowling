"use client"

import { createContext, useCallback, useContext, useState } from "react"

import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error"

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Action results surface as toasts. Field-bound errors and anything raised
// inside a native <dialog> stay inline instead (a dialog sits in the browser's
// top layer and would cover a toast).
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, message, variant }])
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id))
      }, 4000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
        role="region"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-md border px-4 py-2 text-sm shadow-lg",
              item.variant === "success"
                ? "border-primary/40 bg-card text-foreground"
                : "border-destructive/50 bg-card text-destructive"
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
