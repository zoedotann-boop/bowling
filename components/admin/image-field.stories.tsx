import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminCard } from "@/components/admin/admin-ui"
import { ImageField } from "@/components/admin/image-field"

function Example({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return (
    <AdminCard title="פרטי החבילה">
      <ImageField
        label="תמונה"
        tooltip="התמונה הגדולה לצד הכותרת בראש עמוד האירוע."
        value={value}
        onChange={setValue}
      />
    </AdminCard>
  )
}

const meta = {
  title: "Admin/ImageField",
  component: Example,
  args: { initial: "" },
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

export const Empty: Story = {}

export const WithImage: Story = {
  args: { initial: "/events/birthdays-hero.png" },
}
