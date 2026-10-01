import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminCard } from "@/components/admin/admin-ui"
import { ServiceArtPicker } from "@/components/admin/service-art-picker"

function Example({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return (
    <AdminCard title="ג׳ימבורי">
      <ServiceArtPicker
        label="איור"
        tooltip="האיור שמוצג בכרטיס."
        value={value}
        onChange={setValue}
      />
    </AdminCard>
  )
}

const meta = {
  title: "Admin/ServiceArtPicker",
  component: Example,
  args: { initial: "gymboree" },
  decorators: [
    (Story) => (
      <div className="w-[560px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = {}

export const UploadedPictureInstead: Story = {
  args: { initial: "" },
}
