import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ToastProvider, useToast } from "@/components/admin/toast"
import { Button } from "@/components/ui/button"

function ToastDemo() {
  const { toast } = useToast()
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast("נשמר", "success")}>הצג הצלחה</Button>
      <Button
        variant="destructive"
        onClick={() => toast("השמירה נכשלה", "error")}
      >
        הצג שגיאה
      </Button>
    </div>
  )
}

function Example() {
  return (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  )
}

const meta = {
  title: "Admin/Toast",
  component: Example,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
