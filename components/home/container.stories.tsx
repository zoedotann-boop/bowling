import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Container } from "./container"

const meta = {
  title: "Home/Container",
  component: Container,
  args: {
    children: (
      <div className="rounded-xl border-[3px] border-navy bg-cream-warm px-4 py-8 text-center font-heading font-extrabold text-navy">
        Container content (max-width 1200px, responsive padding)
      </div>
    ),
  },
} satisfies Meta<typeof Container>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
