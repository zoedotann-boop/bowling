import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Pricing } from "./pricing"

const meta = {
  title: "Home/Pricing",
  component: Pricing,
} satisfies Meta<typeof Pricing>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
