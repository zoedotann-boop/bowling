import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type OtpEmailProps = {
  otp: string
  expiresInMinutes?: number
}

export default function OtpEmail({
  otp = "123456",
  expiresInMinutes = 5,
}: OtpEmailProps) {
  return (
    <Html dir="rtl" lang="he">
      <Head />
      <Preview>{`קוד התחברות לניהול · ${otp}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Text style={eyebrow}>BOWLING · ADMIN</Text>
            <Heading style={heading}>קוד התחברות לניהול</Heading>
            <Section style={accentBar} />

            <Text style={paragraph}>להלן קוד ההתחברות החד-פעמי שלך:</Text>

            <Section style={codeBox}>
              <Text style={code}>{otp}</Text>
            </Section>

            <Text style={muted}>
              הקוד תקף ל-<span style={mono}>{expiresInMinutes}</span> דקות.
            </Text>
            <Text style={muted}>
              אם לא ביקשת קוד זה, אפשר להתעלם מההודעה.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const COLOR_PAPER = "#FBF7EE"
const COLOR_CREAM = "#F0E8D4"
const COLOR_INK = "#1C2028"
const COLOR_INK_SOFT = "#5E6877"
const COLOR_ACCENT = "#DC4A33"

const FONT_BODY = '"Heebo", "Arial Hebrew", Arial, sans-serif'
const FONT_DISPLAY = '"Suez One", "Arial Hebrew", Georgia, serif'
const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'

const body = {
  backgroundColor: COLOR_CREAM,
  fontFamily: FONT_BODY,
  margin: 0,
  padding: "32px 16px",
  direction: "rtl" as const,
}

const container = {
  margin: "0 auto",
  maxWidth: "520px",
  padding: 0,
}

const card = {
  backgroundColor: COLOR_PAPER,
  border: `2px solid ${COLOR_INK}`,
  borderRadius: "16px",
  boxShadow: `-4px 4px 0 ${COLOR_INK}`,
  padding: "32px 28px",
}

const eyebrow = {
  color: COLOR_INK_SOFT,
  fontFamily: FONT_BODY,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
}

const heading = {
  color: COLOR_INK,
  fontFamily: FONT_DISPLAY,
  fontSize: "30px",
  fontWeight: 700,
  lineHeight: 1.15,
  margin: "0 0 14px",
}

const accentBar = {
  backgroundColor: COLOR_ACCENT,
  borderRadius: "2px",
  height: "3px",
  width: "56px",
  margin: "0 0 24px",
  fontSize: 0,
  lineHeight: "3px",
}

const paragraph = {
  color: COLOR_INK,
  fontFamily: FONT_BODY,
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 20px",
}

const codeBox = {
  backgroundColor: COLOR_ACCENT,
  border: `2px solid ${COLOR_INK}`,
  borderRadius: "16px",
  boxShadow: `-4px 4px 0 ${COLOR_INK}`,
  padding: "20px 16px",
  margin: "0 0 24px",
  textAlign: "center" as const,
}

const code = {
  color: COLOR_PAPER,
  fontFamily: FONT_MONO,
  fontSize: "36px",
  fontWeight: 700,
  letterSpacing: "10px",
  margin: 0,
  textAlign: "center" as const,
  direction: "ltr" as const,
}

const muted = {
  color: COLOR_INK_SOFT,
  fontFamily: FONT_BODY,
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 6px",
}

const mono = {
  fontFamily: FONT_MONO,
  fontWeight: 600,
  color: COLOR_INK,
}
