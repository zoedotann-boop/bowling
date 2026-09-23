import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminModal, ConfirmModal } from "@/components/admin/admin-modal"
import { AdminField, AdminInput } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"

function EditorExample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>עריכת פריט</Button>
      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title="עריכת קטגוריה"
        closeLabel="סגירה"
      >
        <AdminField label="שם הקטגוריה">
          <AdminInput defaultValue="מנות ראשונות" />
        </AdminField>
      </AdminModal>
    </>
  )
}

function ConfirmExample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        מחיקה
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="מחיקה"
        message="הפריט יימחק עם הפרסום. להמשיך?"
        confirmLabel="מחיקה"
        cancelLabel="ביטול"
      />
    </>
  )
}

const meta = {
  title: "Admin/AdminModal",
  component: EditorExample,
  parameters: { layout: "centered" },
} satisfies Meta<typeof EditorExample>

export default meta
type Story = StoryObj<typeof meta>

export const Editor: Story = {}

export const Confirm: Story = {
  render: () => <ConfirmExample />,
}
