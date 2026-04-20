export type ReadResult<T> = { data: T; needsReview: string[] }

export type FieldErrors = Record<string, string[]>

export type WriteResult<T> =
  | { ok: true; data: T; revalidateTags: string[] }
  | { ok: false; fieldErrors: FieldErrors }
