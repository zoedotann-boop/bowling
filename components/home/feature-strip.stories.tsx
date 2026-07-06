import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { FeatureStrip } from "./feature-strip"

const meta = {
  title: "Home/FeatureStrip",
  component: FeatureStrip,
} satisfies Meta<typeof FeatureStrip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
