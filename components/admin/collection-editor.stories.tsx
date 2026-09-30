import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminField, AdminFlag, AdminInput } from "@/components/admin/admin-ui"
import { CollectionEditor } from "@/components/admin/collection-editor"

interface Category {
  label: string
  items: number
  isVisible: boolean
}

function Example() {
  const [items, setItems] = useState<Category[]>([
    { label: "מנות ראשונות", items: 6, isVisible: true },
    { label: "עיקריות", items: 12, isVisible: true },
    { label: "קינוחים", items: 4, isVisible: false },
    { label: "שתייה", items: 18, isVisible: true },
  ])
  return (
    <CollectionEditor
      items={items}
      onChange={setItems}
      createItem={() => ({ label: "", items: 0, isVisible: true })}
      addLabel="הוספת קטגוריה"
      emptyLabel="אין קטגוריות עדיין"
      removeLabel="מחיקת קטגוריה"
      removeMessage="הקטגוריה וכל המנות שבה יימחקו כשתלחצו על שמירה. להמשיך?"
      itemLabel={(item) => item.label}
      itemMeta={(item) => `${item.items} מנות`}
      isHidden={(item) => !item.isVisible}
      renderDetail={(item, update) => (
        <>
          <AdminField label="שם הקטגוריה">
            <AdminInput
              value={item.label}
              onChange={(event) =>
                update({ ...item, label: event.target.value })
              }
            />
          </AdminField>
          <AdminFlag
            label="מוצג"
            checked={item.isVisible}
            onCheckedChange={(isVisible) => update({ ...item, isVisible })}
          />
        </>
      )}
    />
  )
}

const meta = {
  title: "Admin/CollectionEditor",
  component: Example,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  render: function Render() {
    const [items, setItems] = useState<Category[]>([])
    return (
      <CollectionEditor
        items={items}
        onChange={setItems}
        createItem={() => ({ label: "", items: 0, isVisible: true })}
        addLabel="הוספת קטגוריה"
        emptyLabel="אין קטגוריות עדיין"
        removeLabel="מחיקת קטגוריה"
        removeMessage="להמשיך?"
        itemLabel={(item) => item.label}
        renderDetail={(item, update) => (
          <AdminInput
            value={item.label}
            onChange={(event) => update({ ...item, label: event.target.value })}
          />
        )}
      />
    )
  },
}
