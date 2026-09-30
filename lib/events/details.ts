import type { Localized } from "@/lib/db/schema/_shared"

export interface EventPolicyItem {
  title: Localized
  description: Localized
}

export interface EventDetailTexts {
  allowedItems: Localized[]
  forbiddenItems: Localized[]
  rulesNote: Localized
  policyItems: EventPolicyItem[]
  policyNote: Localized
  formIntro: Localized
  formTerms: Localized
  formFootnote: Localized
}

type StoredEventDetailTexts = {
  [K in keyof EventDetailTexts]?: EventDetailTexts[K] | null
}

export function withEventDetailDefaults(
  stored: StoredEventDetailTexts | null | undefined,
  defaults: EventDetailTexts
): EventDetailTexts {
  return {
    allowedItems: stored?.allowedItems ?? defaults.allowedItems,
    forbiddenItems: stored?.forbiddenItems ?? defaults.forbiddenItems,
    rulesNote: stored?.rulesNote ?? defaults.rulesNote,
    policyItems: stored?.policyItems ?? defaults.policyItems,
    policyNote: stored?.policyNote ?? defaults.policyNote,
    formIntro: stored?.formIntro ?? defaults.formIntro,
    formTerms: stored?.formTerms ?? defaults.formTerms,
    formFootnote: stored?.formFootnote ?? defaults.formFootnote,
  }
}
