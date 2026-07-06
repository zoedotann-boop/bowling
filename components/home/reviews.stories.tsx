import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Reviews } from "./reviews"

const meta = {
  title: "Home/Reviews",
  component: Reviews,
} satisfies Meta<typeof Reviews>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
