import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { type Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { Markdown } from "@/components/common/markdown"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await services.legal.getBySlug(slug, locale as Locale)
  if (!page) return { robots: { index: false } }
  return {
    title: page.title ?? slug,
    robots: { index: true },
  }
}

export async function generateStaticParams() {
  const pages = await services.legal.listPublished()
  return pages.map((p) => ({ slug: p.slug }))
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const page = await services.legal.getBySlug(slug, locale as Locale)
  if (!page) notFound()

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      {page.title ? (
        <header className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            {page.title}
          </h1>
        </header>
      ) : null}
      {page.bodyMarkdown ? (
        <Markdown source={page.bodyMarkdown} />
      ) : (
        <p className="text-sm text-ink-muted">—</p>
      )}
    </article>
  )
}
