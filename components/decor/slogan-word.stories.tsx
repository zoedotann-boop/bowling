import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SLOGANS } from "@/lib/slogans"
import { SloganWord } from "./slogan-word"

const meta = {
  title: "Decor/SloganWord",
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Each venue slogan assembled from its authentic painted letters.
export const Words: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6 bg-cream-warm p-8">
      {SLOGANS.map((slogan) => (
        <SloganWord key={slogan.word} slogan={slogan} className="text-[40px]" />
      ))}
    </div>
  ),
}
