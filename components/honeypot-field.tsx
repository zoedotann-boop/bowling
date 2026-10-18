import { HONEYPOT_FIELD } from "@/lib/honeypot"

export function HoneypotField({ label }: { label: string }) {
  return (
    <label aria-hidden className="sr-only">
      {label}
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </label>
  )
}
