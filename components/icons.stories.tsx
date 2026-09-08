import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  BarIcon,
  BowlingIcon,
  EveryoneIcon,
  LanesIcon,
  MenuIcon,
  OpenLateIcon,
  PartyIcon,
} from "./icons"

const ICONS = [
  { name: "Bowling", Icon: BowlingIcon },
  { name: "Party", Icon: PartyIcon },
  { name: "Menu", Icon: MenuIcon },
  { name: "Lanes", Icon: LanesIcon },
  { name: "Everyone", Icon: EveryoneIcon },
  { name: "Bar", Icon: BarIcon },
  { name: "OpenLate", Icon: OpenLateIcon },
]

const meta = {
  title: "Icons/Service & feature icons",
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Vector illustrations used as the service and feature icons; colour is baked in
// from the palette tokens (outline → foreground, cyan → primary, red →
// secondary).
export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {ICONS.map(({ name, Icon }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-sm border border-border bg-card p-5"
        >
          <Icon className="h-16 w-auto" />
          <span className="font-mono text-xs text-mud">{name}</span>
        </div>
      ))}
    </div>
  ),
}
