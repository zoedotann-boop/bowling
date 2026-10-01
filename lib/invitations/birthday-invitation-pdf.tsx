import "server-only"

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

import type { Branch } from "@/lib/branches"
import type { MailAttachment } from "@/lib/email"
import { isBirthdayEvent } from "@/lib/events/slugs"
import {
  birthdayInvitation,
  type BirthdayInvitation,
} from "@/lib/invitations/birthday-invitation"

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

function BirthdayInvitationDocument({
  invitation,
}: {
  invitation: BirthdayInvitation
}) {
  return (
    <Document title="הזמנה ליום הולדת" language="he">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PdfImage
          fixed
          src={join(ASSETS, "birthday-background.jpg")}
          style={styles.background}
        />
        <PdfImage
          src={join(process.cwd(), "public", invitation.logoSrc)}
          style={styles.logo}
        />
        <View style={styles.card}>
          <Text style={[styles.rtl, styles.title]}>יאללה מסיבה!</Text>
          <Text style={[styles.rtl, styles.message]}>
            {`אז החלטתי לחגוג בבאולינג ${invitation.city}!\nאשמח להזמין אותך למסיבת יום ההולדת הכי שווה שיש!`}
          </Text>
          {invitation.when ? (
            <Text style={[styles.rtl, styles.when]}>{invitation.when}</Text>
          ) : null}
          <Text style={[styles.rtl, styles.signOff]}>
            {invitation.celebrants
              ? `אשמח לראותך!\n${invitation.celebrants}!`
              : "אשמח לראותך!"}
          </Text>
        </View>
        <Text style={[styles.rtl, styles.footer]}>{invitation.footer}</Text>
      </Page>
    </Document>
  )
}

function renderBirthdayInvitation(
  invitation: BirthdayInvitation
): Promise<Buffer> {
  return renderToBuffer(<BirthdayInvitationDocument invitation={invitation} />)
}

const INVITATION_FILENAME = "birthday-invitation.pdf"

export async function birthdayInvitationAttachment(
  payload: Record<string, unknown>,
  branch: Branch
): Promise<MailAttachment | undefined> {
  if (!isBirthdayEvent(payload.slug)) return undefined
  try {
    const content = await renderBirthdayInvitation(
      birthdayInvitation(payload, branch)
    )
    return { filename: INVITATION_FILENAME, content }
  } catch (error) {
    console.error("[booking] birthday invitation PDF failed", error)
    return undefined
  }
}
