import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  BirthdayScene,
  BirthdaysIllustration,
  CorporateIllustration,
  GymboreeIllustration,
  NoRoomIllustration,
  TeamIllustration,
} from "./illustrations"

const ILLUSTRATIONS = [
  { name: "Birthdays", Illustration: BirthdaysIllustration },
  { name: "Gymboree", Illustration: GymboreeIllustration },
  { name: "NoRoom", Illustration: NoRoomIllustration },
  { name: "Team", Illustration: TeamIllustration },
  { name: "Corporate", Illustration: CorporateIllustration },
]

const meta = {
  title: "Icons/Illustrations",
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Event illustrations used on the event cards and detail heroes.
export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {ILLUSTRATIONS.map(({ name, Illustration }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-sm border border-border bg-card p-5"
        >
          <Illustration className="h-24 w-auto" />
          <span className="font-mono text-xs text-mud">{name}</span>
        </div>
      ))}
    </div>
  ),
}

// The birthday scene as it fills the pricing CTA panel.
export const Birthday: Story = {
  render: () => (
    <div className="relative h-64 w-full max-w-md overflow-hidden rounded-sm border border-primary bg-navy-deep">
      <BirthdayScene className="absolute inset-0 h-full w-full p-6" />
    </div>
  ),
}
