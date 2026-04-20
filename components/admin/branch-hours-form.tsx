"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { OpeningHoursRow } from "@/lib/services/hours"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { bulkUpsertHoursAction } from "@/app/[locale]/admin/(protected)/_actions/branches"
import { idleState } from "@/app/[locale]/admin/(protected)/_actions/types"

type HoursState = {
  isClosed: boolean
  openTime: string
  closeTime: string
}

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const

function buildInitial(rows: OpeningHoursRow[]): Record<number, HoursState> {
  const base: Record<number, HoursState> = {}
  for (const d of DAYS_OF_WEEK) {
    base[d] = { isClosed: true, openTime: "", closeTime: "" }
  }
  for (const row of rows) {
    base[row.dayOfWeek] = {
      isClosed: row.isClosed,
      openTime: row.openTime ?? "",
      closeTime: row.closeTime ?? "",
    }
  }
  return base
}

export function BranchHoursForm({
  branchId,
  initialRows,
}: {
  branchId: string
  initialRows: OpeningHoursRow[]
}) {
  const t = useTranslations("Admin.branches.hours")
  const tt = useTranslations("Admin.toasts")
  const [state, formAction, pending] = useActionState(
    bulkUpsertHoursAction,
    idleState
  )
  const [days, setDays] = React.useState<Record<number, HoursState>>(() =>
    buildInitial(initialRows)
  )

  useEffect(() => {
    if (state.status === "success") toast.success(tt("hoursSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function updateDay(day: number, patch: Partial<HoursState>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day]!, ...patch } }))
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="branchId" value={branchId} />
      <div className="flex flex-col gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const state = days[day]!
          return (
            <div
              key={day}
              className="grid grid-cols-[8rem_auto_1fr_1fr] items-center gap-3 border border-line bg-surface p-3"
            >
              <span className="text-sm font-medium text-ink">
                {t(`days.${day}`)}
              </span>
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                <Switch
                  checked={state.isClosed}
                  onCheckedChange={(v) => updateDay(day, { isClosed: v })}
                  name={`isClosed.${day}`}
                />
                {t("closed")}
              </label>
              <Field>
                <FieldLabel className="sr-only">
                  {t("openTime")} — {t(`days.${day}`)}
                </FieldLabel>
                <Input
                  type="time"
                  name={`openTime.${day}`}
                  value={state.openTime}
                  onChange={(e) => updateDay(day, { openTime: e.target.value })}
                  disabled={state.isClosed}
                  placeholder={t("openTime")}
                />
              </Field>
              <Field>
                <FieldLabel className="sr-only">
                  {t("closeTime")} — {t(`days.${day}`)}
                </FieldLabel>
                <Input
                  type="time"
                  name={`closeTime.${day}`}
                  value={state.closeTime}
                  onChange={(e) =>
                    updateDay(day, { closeTime: e.target.value })
                  }
                  disabled={state.isClosed}
                  placeholder={t("closeTime")}
                />
              </Field>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {t("save")}
        </Button>
      </div>
    </form>
  )
}
