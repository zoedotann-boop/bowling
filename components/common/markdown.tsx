import * as React from "react"

import { cn } from "@/lib/utils"

type Block =
  | { kind: "h1" | "h2" | "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n")
  const blocks: Block[] = []
  let buffer: string[] = []

  function flushParagraph() {
    if (buffer.length === 0) return
    blocks.push({ kind: "p", text: buffer.join(" ").trim() })
    buffer = []
  }

  let i = 0
  while (i < lines.length) {
    const raw = lines[i] ?? ""
    const line = raw.trimEnd()
    if (line.trim() === "") {
      flushParagraph()
      i++
      continue
    }
    const h3 = line.match(/^###\s+(.*)$/)
    const h2 = line.match(/^##\s+(.*)$/)
    const h1 = line.match(/^#\s+(.*)$/)
    if (h3) {
      flushParagraph()
      blocks.push({ kind: "h3", text: h3[1]! })
      i++
      continue
    }
    if (h2) {
      flushParagraph()
      blocks.push({ kind: "h2", text: h2[1]! })
      i++
      continue
    }
    if (h1) {
      flushParagraph()
      blocks.push({ kind: "h1", text: h1[1]! })
      i++
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph()
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^[-*]\s+/, "").trim())
        i++
      }
      blocks.push({ kind: "ul", items })
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph()
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\.\s+/, "").trim())
        i++
      }
      blocks.push({ kind: "ol", items })
      continue
    }
    buffer.push(line)
    i++
  }
  flushParagraph()
  return blocks
}

type Span =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: Span[] }
  | { kind: "em"; value: Span[] }
  | { kind: "link"; href: string; value: Span[] }

function parseInline(source: string): Span[] {
  const spans: Span[] = []
  let i = 0
  let text = ""
  function push() {
    if (text.length > 0) {
      spans.push({ kind: "text", value: text })
      text = ""
    }
  }
  while (i < source.length) {
    const rest = source.slice(i)
    const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)\)/)
    if (link) {
      push()
      spans.push({
        kind: "link",
        href: link[2]!,
        value: parseInline(link[1]!),
      })
      i += link[0].length
      continue
    }
    if (rest.startsWith("**")) {
      const end = rest.indexOf("**", 2)
      if (end > 2) {
        push()
        spans.push({
          kind: "strong",
          value: parseInline(rest.slice(2, end)),
        })
        i += end + 2
        continue
      }
    }
    if (rest.startsWith("*") && !rest.startsWith("**")) {
      const end = rest.indexOf("*", 1)
      if (end > 1) {
        push()
        spans.push({ kind: "em", value: parseInline(rest.slice(1, end)) })
        i += end + 1
        continue
      }
    }
    text += source[i]
    i++
  }
  push()
  return spans
}

function renderSpans(spans: Span[], key = ""): React.ReactNode {
  return spans.map((span, idx) => {
    const k = `${key}-${idx}`
    if (span.kind === "text")
      return <React.Fragment key={k}>{span.value}</React.Fragment>
    if (span.kind === "strong")
      return <strong key={k}>{renderSpans(span.value, k)}</strong>
    if (span.kind === "em") return <em key={k}>{renderSpans(span.value, k)}</em>
    const href = span.href
    const isExternal = /^(https?:)?\/\//.test(href)
    return (
      <a
        key={k}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-accent underline decoration-accent/50 hover:decoration-accent"
      >
        {renderSpans(span.value, k)}
      </a>
    )
  })
}

export function Markdown({
  source,
  className,
}: {
  source: string
  className?: string
}) {
  const blocks = parseBlocks(source)
  return (
    <div className={cn("flex flex-col gap-4 text-ink", className)}>
      {blocks.map((block, idx) => {
        const key = `b-${idx}`
        if (block.kind === "h1")
          return (
            <h1
              key={key}
              className="text-3xl font-semibold tracking-tight text-ink"
            >
              {renderSpans(parseInline(block.text), key)}
            </h1>
          )
        if (block.kind === "h2")
          return (
            <h2
              key={key}
              className="mt-4 text-2xl font-semibold tracking-tight text-ink"
            >
              {renderSpans(parseInline(block.text), key)}
            </h2>
          )
        if (block.kind === "h3")
          return (
            <h3
              key={key}
              className="mt-2 text-lg font-semibold tracking-tight text-ink"
            >
              {renderSpans(parseInline(block.text), key)}
            </h3>
          )
        if (block.kind === "p")
          return (
            <p key={key} className="text-base leading-relaxed text-ink-soft">
              {renderSpans(parseInline(block.text), key)}
            </p>
          )
        if (block.kind === "ul" || block.kind === "ol") {
          const items = block.items
          const Tag = block.kind
          const className =
            block.kind === "ul"
              ? "list-disc space-y-1 ps-6 text-base text-ink-soft marker:text-ink-muted"
              : "list-decimal space-y-1 ps-6 text-base text-ink-soft marker:text-ink-muted"
          return (
            <Tag key={key} className={className}>
              {items.map((item, j) => (
                <li key={`${key}-i-${j}`}>
                  {renderSpans(parseInline(item), `${key}-i-${j}`)}
                </li>
              ))}
            </Tag>
          )
        }
        return null
      })}
    </div>
  )
}
