"use client"

import { useTranslations } from "next-intl"
import { createContext, useContext, useState } from "react"

import { Button } from "@/components/ui/button"
import { locales, type Locale } from "@/lib/locales"
import { cn } from "@/lib/utils"

import { useToast } from "./toast"

interface SectionContextValue {
  slug: string
  locale: Locale
}

const SectionContext = createContext<SectionContextValue | null>(null)

// Every localized field reads the active editing locale from here, so a single
// language toggle drives all of them. Throws when used outside a SectionForm.
export function useSectionContext(): SectionContextValue {
  const context = useContext(SectionContext)
  if (!context) {
    throw new Error("useSectionContext must be used within a SectionForm")
  }
  return context
}

export interface SectionFormProps<T> {
  slug: string
  title: string
  description?: string
  draft: T
  onSave: (draft: T) => Promise<{ ok: boolean; error?: string }>
  children: React.ReactNode
}

// The backbone of every content page. Holds the active editing locale, provides
// it via context, and owns the single "publish" action. The draft itself is
// held by the page (useState) and mutated by the fields directly; switching
// locale never touches the draft — it just renders a different slice.
export function SectionForm<T>({
  slug,
  title,
  description,
  draft,
  onSave,
  children,
}: SectionFormProps<T>) {
  const t = useTranslations("admin.common")
  const { toast } = useToast()
  const [locale, setLocale] = useState<Locale>("he")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const result = await onSave(draft)
      if (result.ok) {
        toast(t("saved"), "success")
      } else {
        const code = result.error ?? "saveError"
        const message = t.has(`error.${code}`)
          ? t(`error.${code}`)
          : t("saveError")
        toast(message, "error")
      }
    } catch {
      toast(t("saveError"), "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionContext.Provider value={{ slug, locale }}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}
      >
        <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-border bg-cream/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex overflow-hidden rounded-md border border-border"
              role="group"
              aria-label={t("language")}
            >
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium uppercase outline-none",
                    locale === code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
        <div className="space-y-4 px-0">{children}</div>
      </form>
    </SectionContext.Provider>
  )
}
