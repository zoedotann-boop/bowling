import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { InfoTooltip } from "@/components/admin/info-tooltip"

const meta = {
  title: "Admin/InfoTooltip",
  component: InfoTooltip,
  parameters: { layout: "centered" },
  args: { text: "מספר בינלאומי, ספרות בלבד וללא +" },
} satisfies Meta<typeof InfoTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
