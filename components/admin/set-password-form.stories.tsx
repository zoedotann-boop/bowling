import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SetPasswordForm } from "@/components/admin/set-password-form"

const meta = {
  title: "Admin/SetPasswordForm",
  component: SetPasswordForm,
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-[420px] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: { token: "token", email: "dana@example.com" },
} satisfies Meta<typeof SetPasswordForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ExpiredLink: Story = { args: { token: null } }
