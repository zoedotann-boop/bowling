import { getTranslations } from "next-intl/server"
import {
  IconCake,
  IconCheck,
  IconDeviceGamepad2,
  IconGift,
  IconSparkles,
  IconToolsKitchen2,
  IconUsers,
  IconX,
} from "@tabler/icons-react"
import type { SitePackage } from "@/lib/site-branch"
import { BowlingCard } from "@/components/brand/bowling-card"
import { Eyebrow } from "@/components/common/eyebrow"

const STEP_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  welcome: IconUsers,
  game: IconDeviceGamepad2,
  table: IconToolsKitchen2,
  cake: IconCake,
}

export async function BirthdaysHero() {
  const t = await getTranslations("Birthdays")
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14">
        <div className="flex flex-wrap gap-2">
          {["badge1", "badge2", "badge3"].map((k) => (
            <span
              key={k}
              className="rounded-full border-2 border-ink bg-paper px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-ink uppercase shadow-block-sm"
            >
              {t(`badges.${k}` as "badges.badge1")}
            </span>
          ))}
        </div>
        <Eyebrow tone="red" className="mt-5">
          {t("eyebrow")}
        </Eyebrow>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-ink/80">
          {t("subtitle")}
        </p>
      </div>
    </section>
  )
}

export async function BirthdaysHowItWorks() {
  const t = await getTranslations("Birthdays.howItWorks")
  const steps = ["welcome", "game", "table", "cake"] as const
  return (
    <section className="border-t-2 border-ink bg-cream-2">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="ink">{t("eyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{t("duration")}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {steps.map((key, i) => {
            const Icon = STEP_ICONS[key]!
            return (
              <li key={key}>
                <BowlingCard
                  surface="paper"
                  ring="ink"
                  shadow="sm"
                  contentClassName="flex items-center gap-3 px-4 py-3.5"
                >
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-lg border-2 border-ink bg-yellow text-ink">
                    <Icon className="size-5" aria-hidden />
                    <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-ink font-display text-xs text-cream">
                      {i + 1}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-ink">
                      {t(`steps.${key}.label` as "steps.welcome.label")}
                    </div>
                    <div className="text-xs text-ink/70">
                      {t(`steps.${key}.sub` as "steps.welcome.sub")}
                    </div>
                  </div>
                </BowlingCard>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 rounded-lg border-2 border-dashed border-ink/30 bg-paper px-3 py-2 text-xs text-ink/70">
          {t("freebies")}
        </p>
      </div>
    </section>
  )
}

export async function BirthdaysPackageCompare({
  packages,
}: {
  packages: SitePackage[]
}) {
  const t = await getTranslations("Birthdays.packages")
  // Pick first two packages for the compare card; if absent, show fallbacks.
  const weekday = packages[0]
  const weekend = packages[1] ?? packages[0]
  if (!weekday) return null

  return (
    <section className="border-t-2 border-ink bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="red">{t("eyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{t("subtitle")}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <BowlingCard
            surface="paper"
            ring="ink"
            shadow="md"
            contentClassName="px-5 py-5"
          >
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink/60 uppercase">
              {t("weekday.tag")}
            </div>
            <div className="mt-1 text-sm font-extrabold text-ink">
              {t("weekday.label")}
            </div>
            <div className="mt-3 font-display text-3xl text-ink">
              {weekday.price}
            </div>
            <div className="mt-1 text-xs text-ink/70">{t("weekday.upTo")}</div>
          </BowlingCard>
          <BowlingCard
            surface="ink"
            ring="yellow"
            shadow="lg"
            contentClassName="px-5 py-5"
          >
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-yellow uppercase">
              {t("weekend.tag")}
            </div>
            <div className="mt-1 text-sm font-extrabold text-cream">
              {t("weekend.label")}
            </div>
            <div className="mt-3 font-display text-3xl text-yellow">
              {weekend.price}
            </div>
            <div className="mt-1 text-xs text-cream/70">
              {t("weekend.upTo")}
            </div>
          </BowlingCard>
        </div>

        <BowlingCard
          surface="paper"
          ring="turq"
          shadow="md"
          className="mt-6"
          contentClassName="px-4 py-4 sm:px-5"
        >
          <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink/60 uppercase">
            {t("included")}
          </div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink/85">
            {weekday.perks}
          </p>
        </BowlingCard>
      </div>
    </section>
  )
}

export async function BirthdaysUpgrades() {
  const t = await getTranslations("Birthdays.upgrades")
  const items = [
    { key: "play", icon: IconDeviceGamepad2 },
    { key: "balloons", icon: IconSparkles },
    { key: "pin", icon: IconGift },
    { key: "drinks", icon: IconToolsKitchen2 },
    { key: "bottles", icon: IconToolsKitchen2 },
    { key: "coffee", icon: IconSparkles },
  ] as const
  return (
    <section className="border-t-2 border-ink bg-cream-2">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="ink">{t("eyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
          {t("title")}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map(({ key, icon: Icon }) => (
            <li key={key}>
              <BowlingCard
                surface="paper"
                ring="ink"
                shadow="sm"
                contentClassName="flex items-center gap-3 px-4 py-3"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-cream text-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-ink">
                    {t(`items.${key}.label` as "items.play.label")}
                  </div>
                  <div className="text-xs text-ink/70">
                    {t(`items.${key}.sub` as "items.play.sub")}
                  </div>
                </div>
                <span className="font-display text-sm whitespace-nowrap text-red">
                  {t(`items.${key}.price` as "items.play.price")}
                </span>
              </BowlingCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export async function BirthdaysDosDonts() {
  const t = await getTranslations("Birthdays.dosDonts")
  const allowed = ["cake", "candy", "marshmallow", "fruits"] as const
  const forbidden = [
    "outsideFood",
    "outsideDrinks",
    "fireworks",
    "decor",
  ] as const
  return (
    <section className="border-t-2 border-ink bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="red">{t("eyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <BowlingCard
            surface="paper"
            ring="ink"
            shadow="md"
            contentClassName="px-4 py-4"
          >
            <div className="flex items-center gap-2 text-ink">
              <span className="grid size-6 place-items-center rounded-full bg-ink text-cream">
                <IconCheck className="size-3.5" stroke={3} />
              </span>
              <span className="text-sm font-extrabold uppercase">
                {t("allowed")}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink/85">
              {allowed.map((k) => (
                <li key={k} className="flex items-start gap-2">
                  <IconCheck className="mt-0.5 size-3.5 shrink-0 text-ink/60" />
                  <span>{t(`allowedItems.${k}` as "allowedItems.cake")}</span>
                </li>
              ))}
            </ul>
          </BowlingCard>
          <BowlingCard
            surface="cream"
            ring="ink"
            shadow="md"
            contentClassName="px-4 py-4"
          >
            <div className="flex items-center gap-2 text-ink">
              <span className="grid size-6 place-items-center rounded-full border-2 border-ink bg-paper text-ink">
                <IconX className="size-3.5" stroke={3} />
              </span>
              <span className="text-sm font-extrabold uppercase">
                {t("forbidden")}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink/60 line-through">
              {forbidden.map((k) => (
                <li key={k} className="flex items-start gap-2">
                  <IconX className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {t(`forbiddenItems.${k}` as "forbiddenItems.outsideFood")}
                  </span>
                </li>
              ))}
            </ul>
          </BowlingCard>
        </div>
      </div>
    </section>
  )
}

export async function BirthdaysPolicy() {
  const t = await getTranslations("Birthdays.policy")
  const rules = [
    "deposit",
    "form",
    "cancel",
    "winter",
    "shared",
    "arrival",
    "payment",
  ] as const
  return (
    <section className="border-t-2 border-ink bg-cream-2">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="red">{t("eyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{t("subtitle")}</p>
        <BowlingCard
          surface="paper"
          ring="ink"
          shadow="md"
          className="mt-6"
          contentClassName="divide-y divide-dashed divide-ink/20"
        >
          {rules.map((k) => (
            <div key={k} className="px-4 py-3.5">
              <div className="text-sm font-extrabold text-ink">
                {t(`rules.${k}.label` as "rules.deposit.label")}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-ink/70">
                {t(`rules.${k}.body` as "rules.deposit.body")}
              </div>
            </div>
          ))}
        </BowlingCard>
        <p className="mt-3 text-[11px] text-ink/60">{t("footnote")}</p>
      </div>
    </section>
  )
}
