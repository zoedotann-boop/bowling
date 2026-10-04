import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { TimeOptionsEditor } from "@/components/admin/time-options-editor"

function Example({ initial }: { initial: string[] }) {
  const [times, setTimes] = useState(initial)
  return <TimeOptionsEditor times={times} onChange={setTimes} />
}

const meta = {
  title: "Admin/TimeOptionsEditor",
  component: Example,
  decorators: [
    (Story) => (
      <div className="w-[560px] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: { initial: [] },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const PartyTimes: Story = {
  args: { initial: ["10:00", "12:30", "16:00", "18:30"] },
}
