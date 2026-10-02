"use client"

import { Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { parseWholeNumber } from "@/lib/admin/drafts"
import { blankPrice, type MenuItemPrice } from "@/lib/menu"
import { cn } from "@/lib/utils"

import { AdminInput, AdminToggle } from "./admin-ui"
import { InfoTooltip } from "./info-tooltip"
import { useSectionContext } from "./section-form"

const rowClass =
  "grid grid-cols-[minmax(0,1fr)_6.5rem_auto_auto] items-center gap-2"

export function MenuPricesEditor({
  prices,
  onChange,
}: {
  prices: MenuItemPrice[]
  onChange: (prices: MenuItemPrice[]) => void
}) {
  const t = useTranslations("admin.menu")
  const { locale } = useSectionContext()

  function update(index: number, next: Partial<MenuItemPrice>) {
    onChange(
      prices.map((price, i) => (i === index ? { ...price, ...next } : price))
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {t("itemPrices")}
        <InfoTooltip text={t("itemPricesTip")} />
      </legend>
      {prices.length > 0 && (
        <div
          className={cn(rowClass, "text-xs text-muted-foreground")}
          aria-hidden
        >
          <span>{t("priceLabel")}</span>
          <span>{t("priceAmount")}</span>
          <span>{t("priceVisible")}</span>
          <span className="w-8" />
        </div>
      )}
      {prices.map((price, index) => (
        <div
          key={index}
          className={cn(rowClass, !price.isVisible && "opacity-60")}
        >
          <AdminInput
            aria-label={t("priceLabel")}
            dir={locale === "he" ? "rtl" : "ltr"}
            placeholder={t("priceLabelPlaceholder")}
            value={price.label[locale] ?? ""}
            onChange={(event) =>
              update(index, {
                label: { ...price.label, [locale]: event.target.value },
              })
            }
          />
          <AdminInput
            aria-label={t("priceAmount")}
            type="number"
            min={0}
            step={1}
            dir="ltr"
            value={price.amount ?? ""}
            onChange={(event) =>
              update(index, { amount: parseWholeNumber(event.target.value) })
            }
          />
          <AdminToggle
            aria-label={t("priceVisible")}
            checked={price.isVisible}
            onCheckedChange={(isVisible) => update(index, { isVisible })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("removePrice")}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onChange(prices.filter((_, i) => i !== index))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...prices, blankPrice()])}
      >
        <Plus />
        {t("addPrice")}
      </Button>
    </fieldset>
  )
}
