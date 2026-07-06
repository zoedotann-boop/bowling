import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { PromoBar } from "./promo-bar"

const meta = {
  title: "Home/PromoBar",
  component: PromoBar,
} satisfies Meta<typeof PromoBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
