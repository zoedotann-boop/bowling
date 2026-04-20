import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

const TICKET_RED = "#dc3a2c"
const PAPER = "#fbfaf1"

const pinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path
    d="M16 2.5c-3 0-4.6 2.2-4.6 5 0 1.6.5 2.9 1.1 4-1.5 2-2.7 4.8-2.7 8.6 0 5.2 2.8 9.4 6.2 9.4s6.2-4.2 6.2-9.4c0-3.8-1.2-6.6-2.7-8.6.6-1.1 1.1-2.4 1.1-4 0-2.8-1.6-5-4.6-5z"
    fill="${PAPER}"
  />
  <path
    d="M12.4 9.6c1 .6 2.2 1 3.6 1s2.6-.4 3.6-1c-.2.6-.5 1.2-.9 1.7-.7.3-1.7.5-2.7.5s-2-.2-2.7-.5c-.4-.5-.7-1.1-.9-1.7z"
    fill="${TICKET_RED}"
  />
  <path
    d="M11.7 12.6c1.2.6 2.7.9 4.3.9s3.1-.3 4.3-.9c.2.5.4 1 .5 1.5-1.4.6-3 1-4.8 1s-3.4-.4-4.8-1c.1-.5.3-1 .5-1.5z"
    fill="${TICKET_RED}"
  />
</svg>
`

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: TICKET_RED,
        borderRadius: 7,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(pinSvg)}`}
        width={28}
        height={28}
        alt=""
      />
    </div>,
    { ...size }
  )
}
