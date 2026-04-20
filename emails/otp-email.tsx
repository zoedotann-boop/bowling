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
          <Heading style={heading}>קוד התחברות לניהול</Heading>
          <Text style={paragraph}>להלן קוד ההתחברות החד-פעמי שלך:</Text>
          <Section style={codeBox}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={muted}>הקוד תקף ל-{expiresInMinutes} דקות.</Text>
          <Text style={muted}>אם לא ביקשת קוד זה, אפשר להתעלם מההודעה.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: "#f5f5f5",
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: "24px",
}

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "32px",
}

const heading = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 16px",
}

const paragraph = {
  color: "#111827",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 16px",
}

const codeBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 16px",
  textAlign: "center" as const,
}

const code = {
  color: "#111827",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "8px",
  margin: 0,
  textAlign: "center" as const,
}

const muted = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px",
}
