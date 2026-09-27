import type { Preview } from "@storybook/nextjs-vite"
import { Rubik, Heebo } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"

import "../app/globals.css"
import { DEFAULT_BRANCH } from "../lib/branches"
import { BranchProvider } from "../components/branch-context"
import messages from "../messages/he.json"

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
})

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
})

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="he" messages={messages}>
        <BranchProvider initial={DEFAULT_BRANCH}>
          <div
            dir="rtl"
            className={`${rubik.variable} ${heebo.variable} font-sans`}
          >
            <Story />
          </div>
        </BranchProvider>
      </NextIntlClientProvider>
    ),
  ],
}

export default preview
