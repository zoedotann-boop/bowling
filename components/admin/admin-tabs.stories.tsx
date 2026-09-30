import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AdminTabs } from "@/components/admin/admin-tabs"
import { AdminCard, AdminField, AdminInput } from "@/components/admin/admin-ui"

function Example() {
  return (
    <AdminTabs
      tabs={[
        {
          value: "details",
          label: "פרטי הסניף",
          content: (
            <AdminCard title="פרטי הסניף">
              <AdminField label="שם הסניף">
                <AdminInput defaultValue="באולינג רמת גן" />
              </AdminField>
            </AdminCard>
          ),
        },
        {
          value: "contact",
          label: "יצירת קשר",
          content: (
            <AdminCard title="יצירת קשר">
              <AdminField label="טלפון">
                <AdminInput dir="ltr" defaultValue="03-1234567" />
              </AdminField>
            </AdminCard>
          ),
        },
        {
          value: "hours",
          label: "שעות פעילות",
          content: <AdminCard title="שעות פעילות">א׳–ה׳ 10:00–02:00</AdminCard>,
        },
      ]}
    />
  )
}

const meta = {
  title: "Admin/AdminTabs",
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
