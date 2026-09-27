import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { NotFoundPage } from "./not-found-page"

const meta = {
  title: "Pages/NotFoundPage",
  component: NotFoundPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NotFoundPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
