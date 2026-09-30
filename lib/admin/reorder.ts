export function followMove(selected: number, from: number, to: number) {
  if (selected === from) return to
  if (from < selected && to >= selected) return selected - 1
  if (from > selected && to <= selected) return selected + 1
  return selected
}

export function followRemove(selected: number, removed: number) {
  if (removed < selected) return selected - 1
  if (removed === selected) return Math.max(0, selected - 1)
  return selected
}
