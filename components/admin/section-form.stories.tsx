import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { AdminCard } from "@/components/admin/admin-ui"
import { LocalizedField } from "@/components/admin/localized-field"
import { SectionForm } from "@/components/admin/section-form"
import { ToastProvider } from "@/components/admin/toast"
import type { Localized } from "@/lib/db/schema/_shared"

interface Draft {
  slug: string
  title: Localized
  intro: Localized
}

function Example() {
  const [draft, setDraft] = useState<Draft>({
    slug: "ramat-gan",
    title: { he: "התפריט שלנו", en: "Our menu" },
    intro: { he: "אוכל טוב לצד המסלולים", en: "" },
  })
  return (
    <SectionForm
      slug={draft.slug}
      title="תפריט"
      draft={draft}
      onSave={async () => ({ ok: true })}
    >
      <AdminCard title="כותרת">
        <LocalizedField
          label="כותרת"
          value={draft.title}
          onChange={(title) => setDraft((prev) => ({ ...prev, title }))}
        />
        <LocalizedField
          label="תיאור"
          multiline
          value={draft.intro}
          onChange={(intro) => setDraft((prev) => ({ ...prev, intro }))}
        />
      </AdminCard>
    </SectionForm>
  )
}

const meta = {
  title: "Admin/SectionForm",
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
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
