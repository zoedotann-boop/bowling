import { describe, expect, test } from "bun:test"
import { NextRequest } from "next/server"
import {
  getRewrittenUrl,
  isRewrite,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server"

import { config, proxy } from "./proxy"

const home = (cookie?: string) =>
  new NextRequest("https://bowling.test/", {
    headers: cookie ? { cookie } : {},
  })

describe("proxy", () => {
  test("only runs on the home page", () => {
    expect(unstable_doesMiddlewareMatch({ config, url: "/" })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, url: "/menu" })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: "/branches" })).toBe(
      false
    )
  })

  test("shows the branch chooser to first-time visitors", () => {
    const response = proxy(home())
    expect(response && isRewrite(response)).toBe(true)
    expect(response && getRewrittenUrl(response)).toBe(
      "https://bowling.test/branches"
    )
  })

  test("shows the chooser when the saved branch is unknown", () => {
    const response = proxy(home("BRANCH=haifa"))
    expect(response && isRewrite(response)).toBe(true)
  })

  test("serves the home page once a branch was chosen", () => {
    expect(proxy(home("BRANCH=rishon"))).toBeUndefined()
    expect(proxy(home("BRANCH=ramat-gan"))).toBeUndefined()
  })
})
