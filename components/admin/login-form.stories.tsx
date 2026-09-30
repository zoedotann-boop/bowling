import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { LoginForm } from "@/components/admin/login-form"

const meta = {
  title: "Admin/LoginForm",
  component: LoginForm,
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-[420px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
