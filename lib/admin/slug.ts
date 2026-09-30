export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
}

export function nextFreeSlug(base: string, used: string[]): string {
  let index = 1
  while (used.includes(`${base}-${index}`)) index += 1
  return `${base}-${index}`
}
