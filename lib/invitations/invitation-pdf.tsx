import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import {
  Document,
  Font,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer"

import { BRANCHES, type Branch } from "@/lib/branches"
import type { MailAttachment } from "@/lib/email"
import { eventInvitation, type Invitation } from "@/lib/invitations/invitation"

const ASSETS = join(process.cwd(), "lib/invitations/assets")

Font.register({
  family: "Rubik",
  fonts: [
    { src: join(ASSETS, "Rubik-Regular.ttf"), fontWeight: 400 },
    { src: join(ASSETS, "Rubik-Bold.ttf"), fontWeight: 700 },
    { src: join(ASSETS, "Rubik-Black.ttf"), fontWeight: 900 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    fontFamily: "Rubik",
    color: "#ffffff",
    textAlign: "center",
  },
  rtl: { direction: "rtl" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: "cover",
  },
  logo: {
    position: "absolute",
    top: 52,
    left: 44,
    width: 225,
    transform: "rotate(-13deg)",
  },
  card: {
    position: "absolute",
    top: 140,
    left: 150,
    right: 150,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    transform: "rotate(1.5deg)",
  },
  title: { fontSize: 34, fontWeight: 900 },
  message: { fontSize: 22, lineHeight: 1.35, maxWidth: 470 },
  when: { fontSize: 20, fontWeight: 700, marginTop: 4 },
  signOff: { fontSize: 22, fontWeight: 900, lineHeight: 1.3 },
  footer: {
    position: "absolute",
    top: 516,
    left: 150,
    right: 150,
    fontSize: 17,
    transform: "rotate(1.5deg)",
  },
})

const LOGO_TIMEOUT_MS = 5000

async function readLogo(src: string): Promise<Buffer> {
  if (src.startsWith("/")) return readFile(join(process.cwd(), "public", src))
  const res = await fetch(src, { signal: AbortSignal.timeout(LOGO_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const isPngOrJpeg = (data: Buffer) =>
  data.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) ||
  data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))

async function loadLogo(branch: Branch): Promise<Buffer> {
  const bundled = BRANCHES[branch.id].logo.src
  if (branch.logo.src !== bundled) {
    try {
      const data = await readLogo(branch.logo.src)
      if (isPngOrJpeg(data)) return data
      console.warn("[booking] invitation logo is not PNG/JPEG; using default")
    } catch (error) {
      console.warn("[booking] invitation logo failed; using default", error)
    }
  }
  return readLogo(bundled)
}

function InvitationDocument({
  invitation,
  logo,
}: {
  invitation: Invitation
  logo: Buffer
}) {
  return (
    <Document title="הזמנה לבאולינג" language="he">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PdfImage
          fixed
          src={join(ASSETS, "birthday-background.jpg")}
          style={styles.background}
        />
        <PdfImage src={logo} style={styles.logo} />
        <View style={styles.card}>
          <Text style={[styles.rtl, styles.title]}>יאללה מסיבה!</Text>
          <Text style={[styles.rtl, styles.message]}>{invitation.message}</Text>
          {invitation.when ? (
            <Text style={[styles.rtl, styles.when]}>{invitation.when}</Text>
          ) : null}
          <Text style={[styles.rtl, styles.signOff]}>
            {invitation.host
              ? `אשמח לראותך!\n${invitation.host}!`
              : "אשמח לראותך!"}
          </Text>
        </View>
        <Text style={[styles.rtl, styles.footer]}>{invitation.footer}</Text>
      </Page>
    </Document>
  )
}

const INVITATION_FILENAME = "invitation.pdf"

export async function invitationAttachment(
  payload: Record<string, unknown>,
  branch: Branch
): Promise<MailAttachment | undefined> {
  try {
    const content = await renderToBuffer(
      <InvitationDocument
        invitation={eventInvitation(payload, branch)}
        logo={await loadLogo(branch)}
      />
    )
    return { filename: INVITATION_FILENAME, content }
  } catch (error) {
    console.error("[booking] invitation PDF failed", error)
    return undefined
  }
}
