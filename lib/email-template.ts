import "server-only"

import type { Branch } from "@/lib/branches"
import { escapeHtml } from "@/lib/email"

const C = {
  bg: "#141517", // page background (concrete)
  card: "#1f2124", // raised concrete card
  rowAlt: "#191b1d", // alternate table row / label cell
  deep: "#0d0e0f", // header + footer slab
  text: "#fefcfa", // off-white
  soft: "#cfd1d4", // slightly dimmed off-white (values)
  muted: "#9b9ea3", // muted grey text
  faint: "#6c6f74", // faint grey (fine print)
  border: "#2b2d31", // concrete seam
  cyan: "#02b2cd", // LED primary
  red: "#e2212a", // red pop
} as const

const FONT = "'Heebo','Rubik',Arial,Helvetica,sans-serif"

export const BRAND_HE = "באולינג"

interface EmailShellInput {
  branch: Branch
  preheader: string
  heading: string
  intro?: string
  body: string
  contactLinks?: boolean
}

export function emailShell({
  branch,
  preheader,
  heading,
  intro,
  body,
  contactLinks = true,
}: EmailShellInput): string {
  const introHtml = intro
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${C.muted};text-align:right;">${escapeHtml(intro)}</p>`
    : ""

  const contactHtml = contactLinks
    ? `<div style="margin-top:4px;font-size:13px;color:${C.muted};">
                  <a href="tel:${escapeHtml(branch.phone)}" style="color:${C.cyan};text-decoration:none;font-weight:700;">${escapeHtml(branch.phone)}</a>
                  &nbsp;·&nbsp;
                  <a href="https://wa.me/${escapeHtml(branch.whatsapp)}" style="color:${C.cyan};text-decoration:none;font-weight:700;">WhatsApp</a>
                </div>`
    : ""

  return `<!doctype html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${C.bg};">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${escapeHtml(preheader)}</span>
    <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 12px;direction:rtl;">
      <tr>
        <td align="center">
          <table role="presentation" dir="rtl" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.border};border-radius:2px;overflow:hidden;direction:rtl;text-align:right;">
            <!-- LED accent rule -->
            <tr><td style="height:3px;background:${C.cyan};font-size:0;line-height:0;">&nbsp;</td></tr>
            <!-- Header -->
            <tr>
              <td dir="rtl" style="background:${C.deep};padding:24px 32px;text-align:right;direction:rtl;">
                <span style="display:inline-block;width:11px;height:11px;margin-left:10px;background:${C.cyan};border-radius:2px;vertical-align:middle;"></span>
                <span style="font-family:${FONT};font-size:22px;font-weight:900;letter-spacing:-0.5px;color:${C.text};vertical-align:middle;">${escapeHtml(BRAND_HE)}</span>
                <div style="margin-top:6px;font-family:${FONT};font-size:13px;font-weight:700;color:${C.muted};">${escapeHtml(branch.name.he)}</div>
              </td>
            </tr>
            <!-- Hero + body -->
            <tr>
              <td style="padding:32px;font-family:${FONT};text-align:right;">
                <h1 style="margin:0 0 ${intro ? "14px" : "20px"};font-size:24px;font-weight:900;letter-spacing:-0.5px;color:${C.text};text-align:right;">${escapeHtml(heading)}</h1>
                ${introHtml}
                ${body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:${C.deep};padding:24px 32px;font-family:${FONT};border-top:1px solid ${C.border};text-align:right;">
                <div style="font-size:14px;font-weight:900;color:${C.text};">${escapeHtml(BRAND_HE)} · ${escapeHtml(branch.name.he)}</div>
                <div style="margin-top:6px;font-size:13px;line-height:1.6;color:${C.muted};">${escapeHtml(branch.addressFull.he)}</div>
                ${contactHtml}
                <div style="margin-top:14px;font-size:11px;color:${C.faint};">הודעה זו נשלחה אוטומטית ממערכת האתר.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function detailTable(rows: [label: string, value: string][]): string {
  if (rows.length === 0) return ""
  const body = rows
    .map(
      ([label, value], i) => `<tr>
        <td align="right" style="padding:10px 14px;background:${C.rowAlt};border-right:2px solid ${C.cyan};font-size:13px;font-weight:800;color:${C.text};white-space:nowrap;vertical-align:top;text-align:right;${i > 0 ? `border-top:1px solid ${C.border};` : ""}">${escapeHtml(label)}</td>
        <td align="right" style="padding:10px 14px;font-size:14px;line-height:1.5;color:${C.soft};vertical-align:top;text-align:right;${i > 0 ? `border-top:1px solid ${C.border};` : ""}">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("")
  return `<table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border:1px solid ${C.border};border-radius:2px;overflow:hidden;direction:rtl;">${body}</table>`
}

export function sectionHeading(text: string): string {
  return `<h2 style="margin:26px 0 10px;font-family:${FONT};font-size:15px;font-weight:900;color:${C.text};text-align:right;">${escapeHtml(text)}</h2>`
}

export function bulletList(items: string[]): string {
  const li = items
    .map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item)}</li>`)
    .join("")
  return `<ul dir="rtl" style="margin:0;padding-right:20px;padding-left:0;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.soft};direction:rtl;text-align:right;">${li}</ul>`
}

export function otpCode(code: string): string {
  return `<table role="presentation" dir="ltr" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 8px;border-collapse:separate;">
    <tr><td align="center" style="padding:20px;background:${C.rowAlt};border:1px solid ${C.border};border-top:2px solid ${C.cyan};border-radius:2px;font-family:${FONT};font-size:34px;font-weight:900;letter-spacing:0.4em;color:${C.text};text-align:center;">${escapeHtml(code)}</td></tr>
  </table>`
}

export function noteParagraph(text: string): string {
  return `<p style="margin:8px 0 0;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.muted};text-align:right;">${escapeHtml(text)}</p>`
}

export function inlineImage(contentId: string, alt: string): string {
  return `<img src="cid:${escapeHtml(contentId)}" alt="${escapeHtml(alt)}" width="320" style="display:block;margin-top:10px;max-width:100%;height:auto;background:#ffffff;border:1px solid ${C.border};border-radius:2px;" />`
}
