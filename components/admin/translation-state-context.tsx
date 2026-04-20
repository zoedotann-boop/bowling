"use client"

import * as React from "react"

import { routing, type Locale } from "@/i18n/routing"

type FieldState = {
  values: Partial<Record<Locale, string>>
  aiFlags: Partial<Record<Locale, boolean>>
}

type Snapshot = {
  fields: Map<string, FieldState>
  version: number
}

type Ctx = {
  sourceLocale: Locale
  register: (
    name: string,
    initial: { values: Partial<Record<Locale, string>>; aiInit: boolean }
  ) => () => void
  getField: (name: string) => FieldState | undefined
  setManualValue: (name: string, locale: Locale, value: string) => void
  setAiValues: (
    translations: Record<string, Partial<Record<Locale, string>>>
  ) => void
  getSourceFields: () => Record<string, string>
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => Snapshot
  initialAiSet: ReadonlySet<Locale>
}

const Context = React.createContext<Ctx | null>(null)

function createStore(sourceLocale: Locale) {
  let snapshot: Snapshot = { fields: new Map(), version: 0 }
  const listeners = new Set<() => void>()

  const notify = () => {
    snapshot = { fields: snapshot.fields, version: snapshot.version + 1 }
    for (const l of listeners) l()
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (cb: () => void) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    register: (
      name: string,
      initial: { values: Partial<Record<Locale, string>>; aiInit: boolean }
    ) => {
      const aiFlags: Partial<Record<Locale, boolean>> = {}
      for (const l of routing.locales) {
        const v = initial.values[l]
        if (l !== sourceLocale && initial.aiInit && v && v.length > 0) {
          aiFlags[l] = true
        }
      }
      snapshot.fields.set(name, { values: { ...initial.values }, aiFlags })
      notify()
      return () => {
        snapshot.fields.delete(name)
        notify()
      }
    },
    setManualValue: (name: string, locale: Locale, value: string) => {
      const current = snapshot.fields.get(name)
      if (!current) return
      current.values[locale] = value
      if (locale !== sourceLocale) current.aiFlags[locale] = false
      notify()
    },
    setAiValues: (
      translations: Record<string, Partial<Record<Locale, string>>>
    ) => {
      for (const [name, perLocale] of Object.entries(translations)) {
        const current = snapshot.fields.get(name)
        if (!current) continue
        for (const [locale, value] of Object.entries(perLocale) as [
          Locale,
          string,
        ][]) {
          if (locale === sourceLocale) continue
          if (typeof value !== "string") continue
          current.values[locale] = value
          current.aiFlags[locale] = true
        }
      }
      notify()
    },
    getField: (name: string) => snapshot.fields.get(name),
    getSourceFields: () => {
      const out: Record<string, string> = {}
      for (const [name, state] of snapshot.fields) {
        const v = state.values[sourceLocale]
        if (typeof v === "string" && v.trim().length > 0) out[name] = v
      }
      return out
    },
  }
}

export function TranslationStateProvider({
  children,
  initialAiLocales,
}: {
  children: React.ReactNode
  initialAiLocales: Locale[]
}) {
  const sourceLocale: Locale = routing.defaultLocale
  const initialAiSet = React.useMemo(
    () => new Set(initialAiLocales),
    [initialAiLocales]
  )
  const [store] = React.useState(() => createStore(sourceLocale))

  const value = React.useMemo<Ctx>(
    () => ({
      sourceLocale,
      register: store.register,
      getField: store.getField,
      setManualValue: store.setManualValue,
      setAiValues: store.setAiValues,
      getSourceFields: store.getSourceFields,
      subscribe: store.subscribe,
      getSnapshot: store.getSnapshot,
      initialAiSet,
    }),
    [sourceLocale, store, initialAiSet]
  )

  return (
    <Context.Provider value={value}>
      {children}
      <HiddenAiFlags />
    </Context.Provider>
  )
}

function HiddenAiFlags() {
  const ctx = useTranslationState()
  const snapshot = React.useSyncExternalStore(ctx.subscribe, ctx.getSnapshot)

  const aiLocale = React.useMemo<Partial<Record<Locale, boolean>>>(() => {
    const out: Partial<Record<Locale, boolean>> = {}
    for (const l of routing.locales) {
      if (l === ctx.sourceLocale) continue
      let any = false
      for (const state of snapshot.fields.values()) {
        if (state.aiFlags[l]) {
          any = true
          break
        }
      }
      if (!any && ctx.initialAiSet.has(l)) {
        for (const state of snapshot.fields.values()) {
          const v = state.values[l]
          if (typeof v === "string" && v.length > 0) {
            any = true
            break
          }
        }
      }
      out[l] = any
    }
    return out
  }, [snapshot, ctx.sourceLocale, ctx.initialAiSet])

  return (
    <>
      {routing.locales
        .filter((l) => l !== ctx.sourceLocale)
        .map((l) => (
          <input
            key={l}
            type="hidden"
            name={`aiGenerated.${l}`}
            value={aiLocale[l] ? "1" : "0"}
          />
        ))}
    </>
  )
}

export function useTranslationState(): Ctx {
  const ctx = React.useContext(Context)
  if (!ctx) {
    throw new Error(
      "useTranslationState must be used within <TranslationStateProvider>"
    )
  }
  return ctx
}

export function useTranslatableField(
  name: string,
  initialValues: Partial<Record<Locale, string>>,
  aiInit: boolean
) {
  const ctx = useTranslationState()
  const snapshot = React.useSyncExternalStore(ctx.subscribe, ctx.getSnapshot)

  const initialValuesRef = React.useRef(initialValues)
  const aiInitRef = React.useRef(aiInit)

  React.useEffect(() => {
    return ctx.register(name, {
      values: initialValuesRef.current,
      aiInit: aiInitRef.current,
    })
  }, [ctx, name])

  const field = snapshot.fields.get(name)
  return {
    sourceLocale: ctx.sourceLocale,
    values: field?.values ?? initialValues,
    setValue: (locale: Locale, value: string) =>
      ctx.setManualValue(name, locale, value),
  }
}
