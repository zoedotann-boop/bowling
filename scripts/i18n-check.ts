#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const MESSAGES_DIR = "messages"
const BASE_LOCALE = "en"
const SOURCE_DIRS = ["app", "components", "lib", "hooks", "i18n"]

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
type JsonObject = { [key: string]: JsonValue }

function flatten(obj: JsonObject, prefix = ""): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flatten(value as JsonObject, full))
    } else {
      keys.push(full)
    }
  }
  return keys
}

function loadLocale(locale: string): string[] {
  const content = readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf8")
  return flatten(JSON.parse(content) as JsonObject)
}

function walk(dir: string, acc: string[] = []): string[] {
  try {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      const stat = statSync(full)
      if (stat.isDirectory()) {
        if (name === "node_modules" || name.startsWith(".")) continue
        walk(full, acc)
      } else if (/\.(tsx?|jsx?|mdx?)$/.test(name)) {
        acc.push(full)
      }
    }
  } catch {
    // directory missing, skip
  }
  return acc
}

const locales = readdirSync(MESSAGES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))

if (!locales.includes(BASE_LOCALE)) {
  console.error(
    `Base locale "${BASE_LOCALE}.json" not found in ${MESSAGES_DIR}`
  )
  process.exit(1)
}

const baseKeys = loadLocale(BASE_LOCALE)
const baseSet = new Set(baseKeys)
let hasError = false

for (const locale of locales) {
  if (locale === BASE_LOCALE) continue
  const keys = new Set(loadLocale(locale))
  const missing = baseKeys.filter((k) => !keys.has(k))
  const extra = [...keys].filter((k) => !baseSet.has(k))
  if (missing.length) {
    console.error(`\n[${locale}] missing keys (${missing.length}):`)
    for (const k of missing) console.error(`  - ${k}`)
    hasError = true
  }
  if (extra.length) {
    console.error(`\n[${locale}] extra keys (${extra.length}):`)
    for (const k of extra) console.error(`  - ${k}`)
    hasError = true
  }
}

const sourceFiles = SOURCE_DIRS.flatMap((d) => walk(d))
const sourceContent = sourceFiles.map((f) => readFileSync(f, "utf8")).join("\n")

const unused: string[] = []
for (const key of baseKeys) {
  const segments = key.split(".")
  const leaf = segments[segments.length - 1]
  const namespace = segments.slice(0, -1).join(".")
  const needles = [key, leaf]
  if (namespace) needles.push(namespace)
  const found = needles.some((needle) => sourceContent.includes(needle))
  if (!found) unused.push(key)
}

if (unused.length) {
  console.error(`\nUnused keys (${unused.length}):`)
  for (const k of unused) console.error(`  - ${k}`)
  hasError = true
}

if (hasError) {
  console.error("\ni18n-check: FAILED")
  process.exit(1)
}
console.log(
  `i18n-check: OK (${baseKeys.length} keys across ${locales.length} locales)`
)
