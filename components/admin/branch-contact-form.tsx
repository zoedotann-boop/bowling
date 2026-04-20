"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { updateBranchContactAction } from "@/app/[locale]/admin/(protected)/_actions/branches"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export type BranchContactInitial = {
  id: string
  slug: string
  phone: string
  whatsapp: string
  email: string
  mapUrl: string
}

export function BranchContactForm({
  initial,
}: {
  initial: BranchContactInitial
}) {
  const t = useTranslations("Admin.contact")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const initialState: FormState<{ id: string; slug: string }> = {
    status: "idle",
  }
  const [state, formAction, pending] = useActionState<
    FormState<{ id: string; slug: string }>,
    FormData
  >(updateBranchContactAction, initialState)

  useEffect(() => {
    if (state.status === "success") toast.success(tt("contactSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  const topError = state.status === "error" ? state.fieldErrors?._?.[0] : null
  const fe =
    state.status === "error"
      ? (state.fieldErrors ?? {})
      : ({} as Record<string, string[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={initial.id} />
          {topError ? (
            <div className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {topError}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>{t("phone")}</FieldLabel>
              <Input
                name="phone"
                defaultValue={initial.phone}
                required
                aria-invalid={fe.phone ? true : undefined}
              />
              {fe.phone ? (
                <p className="text-xs text-destructive">{fe.phone[0]}</p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel>{t("whatsapp")}</FieldLabel>
              <Input
                name="whatsapp"
                defaultValue={initial.whatsapp}
                required
                aria-invalid={fe.whatsapp ? true : undefined}
              />
              {fe.whatsapp ? (
                <p className="text-xs text-destructive">{fe.whatsapp[0]}</p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel>{t("email")}</FieldLabel>
              <Input
                name="email"
                type="email"
                defaultValue={initial.email}
                required
                aria-invalid={fe.email ? true : undefined}
              />
              {fe.email ? (
                <p className="text-xs text-destructive">{fe.email[0]}</p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel>{t("mapUrl")}</FieldLabel>
              <Input
                name="mapUrl"
                type="url"
                defaultValue={initial.mapUrl}
                required
                aria-invalid={fe.mapUrl ? true : undefined}
              />
              {fe.mapUrl ? (
                <p className="text-xs text-destructive">{fe.mapUrl[0]}</p>
              ) : null}
            </Field>
          </div>
          <div className="flex items-center justify-end border-t border-line pt-4">
            <Button type="submit" size="sm" disabled={pending}>
              {tc("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
