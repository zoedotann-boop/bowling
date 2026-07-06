import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Gallery } from "./gallery"

const meta = {
  title: "Home/Gallery",
  component: Gallery,
} satisfies Meta<typeof Gallery>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
