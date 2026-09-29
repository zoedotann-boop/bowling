import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { BRANCHES } from "@/lib/branches"
import { BranchChooser } from "./branch-chooser"

const meta = {
  title: "Home/BranchChooser",
  component: BranchChooser,
  parameters: { layout: "fullscreen" },
  args: { branches: Object.values(BRANCHES) },
} satisfies Meta<typeof BranchChooser>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleBranch: Story = {
  args: { branches: [BRANCHES.rishon] },
}
