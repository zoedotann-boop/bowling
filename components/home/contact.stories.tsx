import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Contact } from "./contact"

const meta = {
  title: "Home/Contact",
  component: Contact,
} satisfies Meta<typeof Contact>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
