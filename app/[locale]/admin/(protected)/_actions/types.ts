export type FormState<T = unknown> =
  | { status: "idle" }
  | { status: "success"; data?: T; message?: string }
  | {
      status: "error"
      fieldErrors?: Record<string, string[]>
      message?: string
    }

export const idleState: FormState = { status: "idle" }
