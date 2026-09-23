import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/admin-ui"

function Example() {
  const [flag, setFlag] = useState(true)
  return (
    <AdminCard title="הגדרות סניף" description="פרטי קשר ומידע כללי">
      <AdminField label="שם הסניף" tooltip="השם שמוצג ללקוחות">
        <AdminInput defaultValue="סניף רמת גן" />
      </AdminField>
      <AdminField label="תיאור">
        <AdminTextarea defaultValue="14 מסלולים עם תאורת LED" />
      </AdminField>
      <AdminField label="סטטוס">
        <AdminSelect defaultValue="open">
          <option value="open">פתוח</option>
          <option value="closed">סגור</option>
        </AdminSelect>
      </AdminField>
      <AdminFlag
        label="יש ג׳ימבורי"
        description="מפעיל את מקטע הג׳ימבורי"
        checked={flag}
        onCheckedChange={setFlag}
      />
    </AdminCard>
  )
}

const meta = {
  title: "Admin/AdminUI",
  component: Example,
  decorators: [
    (Story) => (
      <div className="w-[480px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
