import { describe, expect, test } from "bun:test"

import { followMove, followRemove } from "./reorder"

describe("followMove", () => {
  test("the moved item keeps the selection", () => {
    expect(followMove(1, 1, 4)).toBe(4)
    expect(followMove(4, 4, 0)).toBe(0)
  })

  test("items shift back when an earlier item moves past them", () => {
    expect(followMove(2, 0, 3)).toBe(1)
    expect(followMove(2, 0, 2)).toBe(1)
  })

  test("items shift forward when a later item moves before them", () => {
    expect(followMove(2, 4, 1)).toBe(3)
    expect(followMove(2, 4, 2)).toBe(3)
  })

  test("items outside the moved range stay put", () => {
    expect(followMove(0, 2, 4)).toBe(0)
    expect(followMove(5, 1, 3)).toBe(5)
  })
})

describe("followRemove", () => {
  test("selection after the removed item shifts back", () => {
    expect(followRemove(3, 1)).toBe(2)
  })

  test("removing the selected item selects the previous one", () => {
    expect(followRemove(2, 2)).toBe(1)
    expect(followRemove(0, 0)).toBe(0)
  })

  test("selection before the removed item is unchanged", () => {
    expect(followRemove(1, 3)).toBe(1)
  })
})
