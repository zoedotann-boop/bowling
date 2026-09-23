import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminField, AdminInput } from "@/components/admin/admin-ui"
import { RowTable } from "@/components/admin/row-table"

interface Row {
  id?: string
  label: string
}

function Example() {
  const [items, setItems] = useState<Row[]>([
    { id: "1", label: "מנות ראשונות" },
    { id: "2", label: "עיקריות" },
    { id: "3", label: "שתייה" },
  ])
  return (
    <RowTable
      items={items}
      onChange={setItems}
      createItem={() => ({ label: "" })}
      addLabel="הוספת קטגוריה"
      columns={[{ header: "שם", cell: (item) => item.label || "—" }]}
      editTitle={(item) => item.label || "קטגוריה"}
      renderRow={(item, index, update) => (
        <AdminField label="שם הקטגוריה">
          <AdminInput
            value={item.label}
            onChange={(event) => update({ ...item, label: event.target.value })}
          />
        </AdminField>
      )}
    />
  )
}

const meta = {
  title: "Admin/RowTable",
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
