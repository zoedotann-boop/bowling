"use client"

import * as React from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useLocale, useTranslations } from "next-intl"
import { IconAlertTriangle, IconCheck, IconSend } from "@tabler/icons-react"
import { branches } from "@/lib/branches"
import {
  submitContact,
  type ContactFormState,
} from "@/app/[locale]/(site)/contact/_actions"
import { cn } from "@/lib/utils"

const initialState: ContactFormState = { status: "idle" }

const eventTypeKeys = ["birthday", "corporate", "school", "casual", "other"] as const

const fieldClass =
  "block w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-ink-muted shadow-soft outline-none transition focus:border-ink/30 focus:ring-2 focus:ring-ink/10 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15"

export function ContactForm({ defaultBranchSlug }: { defaultBranchSlug: string }) {
  const t = useTranslations("Contact.form")
  const tEvent = useTranslations("EventTypes")
  const locale = useLocale() as keyof (typeof branches)[number]["displayName"]
  const [state, action] = useActionState(submitContact, initialState)

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-2xl border border-whatsapp/20 bg-whatsapp/5 px-6 py-12 text-center"
      >
        <div className="grid size-14 place-items-center rounded-full bg-whatsapp text-white">
          <IconCheck className="size-7" aria-hidden />
        </div>
        <p className="max-w-sm text-base text-ink">{t("success")}</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-7" noValidate>
      <div className="space-y-5">
        <Field
          label={t("name")}
          name="name"
          required
          error={state.fieldErrors?.name}
        >
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            aria-invalid={!!state.fieldErrors?.name}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t("phone")}
            name="phone"
            required
            error={state.fieldErrors?.phone}
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              className={fieldClass}
              aria-invalid={!!state.fieldErrors?.phone}
            />
          </Field>
          <Field label={t("email")} name="email" error={state.fieldErrors?.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={fieldClass}
              aria-invalid={!!state.fieldErrors?.email}
            />
          </Field>
        </div>
      </div>

      <Fieldset>
        <Field
          label={t("branch")}
          name="branch"
          required
          error={state.fieldErrors?.branch}
        >
          <select
            id="branch"
            name="branch"
            defaultValue={defaultBranchSlug}
            className={cn(fieldClass, "appearance-none bg-no-repeat pe-10 [background-position:right_1rem_center] [background-size:1rem] rtl:[background-position:left_1rem_center]")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
            }}
          >
            {branches.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.displayName[locale]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("eventType")} name="eventType">
          <select
            id="eventType"
            name="eventType"
            defaultValue=""
            className={cn(fieldClass, "appearance-none bg-no-repeat pe-10 [background-position:right_1rem_center] [background-size:1rem] rtl:[background-position:left_1rem_center]")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
            }}
          >
            <option value="">-</option>
            {eventTypeKeys.map((key) => (
              <option key={key} value={tEvent(key)}>
                {tEvent(key)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("preferredDate")} name="preferredDate">
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            className={fieldClass}
          />
        </Field>

        <Field label={t("guests")} name="guests">
          <input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={500}
            inputMode="numeric"
            className={fieldClass}
          />
        </Field>
      </Fieldset>

      <Field
        label={t("message")}
        name="message"
        required
        error={state.fieldErrors?.message}
      >
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={cn(fieldClass, "resize-y leading-relaxed")}
          aria-invalid={!!state.fieldErrors?.message}
        />
      </Field>

      {state.status === "error" && (state.message || !state.fieldErrors) && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <IconAlertTriangle className="size-4 shrink-0 translate-y-0.5" aria-hidden />
          {t("error")}
        </p>
      )}

      <SubmitButton labels={{ idle: t("submit"), busy: t("submitting") }} />
    </form>
  )
}

function Fieldset({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

function SubmitButton({ labels }: { labels: { idle: string; busy: string } }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-surface shadow-card transition hover:scale-[1.01] hover:shadow-hover disabled:opacity-60 disabled:hover:scale-100"
    >
      <IconSend className="size-5 rtl:-scale-x-100" aria-hidden />
      {pending ? labels.busy : labels.idle}
    </button>
  )
}

function Field({
  label,
  name,
  required,
  error,
  children,
}: {
  label: string
  name: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted"
      >
        {label}
        {required && <span className="ms-1 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
