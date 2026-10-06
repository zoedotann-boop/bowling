import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AdminCard, AdminSubsection } from "@/components/admin/admin-ui"
import { WaiverLink } from "@/components/admin/waiver-link"

function Example({ path }: { path: string }) {
  return (
    <AdminCard title="טופס הזמנה">
      <AdminSubsection
        title="קישור אישי לטופס ההתחייבות"
        description="עמוד שמציג רק את טופס ההתחייבות של האירוע, בלי שאר העמוד."
      >
        <WaiverLink path={path} />
      </AdminSubsection>
    </AdminCard>
  )
}

const meta = {
  title: "Admin/WaiverLink",
  component: Example,
  args: { path: "/ramat-gan/events/birthdays/waiver" },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Example>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
