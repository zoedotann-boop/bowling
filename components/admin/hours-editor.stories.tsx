import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminCard } from "@/components/admin/admin-ui"
import { HoursEditor } from "@/components/admin/hours-editor"
import type { GeneralDraft } from "@/lib/actions/admin/schemas"

const initial: GeneralDraft["hours"] = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "10:00",
  close: day === 5 ? "02:00" : "22:00",
  closed: day === 6,
}))

function Example() {
  const [hours, setHours] = useState(initial)
  return (
    <AdminCard
      title="שעות פעילות"
      description="הגדירו לכל יום שעות פתיחה וסגירה, או כבו את המתג בימים שבהם הסניף סגור."
    >
      <HoursEditor value={hours} onChange={setHours} />
    </AdminCard>
  )
}

const meta = {
  title: "Admin/HoursEditor",
  component: Example,
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

export const Default: Story = {}
