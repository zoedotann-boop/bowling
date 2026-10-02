import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { MenuPricesEditor } from "@/components/admin/menu-prices-editor"
import { SectionForm } from "@/components/admin/section-form"
import { ToastProvider } from "@/components/admin/toast"
import type { MenuItemPrice } from "@/lib/menu"

function Example({ initial }: { initial: MenuItemPrice[] }) {
  const [prices, setPrices] = useState(initial)
  return (
    <SectionForm
      slug="ramat-gan"
      title="תפריט"
      draft={prices}
      onSave={async () => ({ ok: true })}
    >
      <MenuPricesEditor prices={prices} onChange={setPrices} />
    </SectionForm>
  )
}

const meta = {
  title: "Admin/MenuPricesEditor",
  component: Example,
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="w-[560px] max-w-full">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
  args: {
    initial: [{ label: { he: "", en: "" }, amount: 45, isVisible: true }],
  },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const SinglePrice: Story = {}

export const DrinkSizes: Story = {
  args: {
    initial: [
      { label: { he: "צ׳ייסר", en: "Chaser" }, amount: 19, isVisible: true },
      { label: { he: "שוט", en: "Shot" }, amount: 29, isVisible: true },
      { label: { he: "בקבוק", en: "Bottle" }, amount: 200, isVisible: false },
    ],
  },
}
