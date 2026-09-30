import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { ConfirmModal } from "@/components/admin/admin-modal"
import { Button } from "@/components/ui/button"

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
        message="המשתמש יימחק מיד. להמשיך?"
        confirmLabel="מחיקה"
        cancelLabel="ביטול"
      />
    </>
  )
}

const meta = {
  title: "Admin/ConfirmModal",
  component: ConfirmExample,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConfirmExample>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
