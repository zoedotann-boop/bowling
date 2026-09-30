import { beforeEach, describe, expect, test } from "bun:test"

import { setPasswordPath } from "@/lib/admin/routes"
import { session, user } from "@/lib/db/schema"
import { addUser, auth, db, linkToken, outbox } from "@/lib/db/testing/auth"

const email = "manager@example.com"
const password = "strike and spare"

async function requestLink(address = email) {
  await auth.api.requestPasswordReset({
    body: { email: address, redirectTo: setPasswordPath(address) },
  })
  return outbox.passwordLinks.at(-1)
}

async function setPassword(newPassword = password) {
  const link = await requestLink()
  await auth.api.resetPassword({
    body: { newPassword, token: linkToken(link!.url) },
  })
}

const signIn = (pass: string) =>
  auth.api.signInEmail({ body: { email, password: pass } })

beforeEach(async () => {
  await db.delete(user)
  outbox.clear()
  await addUser(email)
})

describe("password links", () => {
  test("a user without a password gets an invitation that returns to the set-password page", async () => {
    const link = await requestLink()

    expect(link).toMatchObject({ to: email, kind: "invite" })
    const callback = new URL(link!.url).searchParams.get("callbackURL")
    expect(callback).toBe(setPasswordPath(email))
  })

  test("a user who already has a password gets a reset email", async () => {
    await setPassword()

    expect((await requestLink())?.kind).toBe("reset")
  })

  test("nothing is sent for an address that isn't on the team", async () => {
    await requestLink("stranger@example.com")

    expect(outbox.passwordLinks).toHaveLength(0)
  })

  test("a link works only once", async () => {
    const link = await requestLink()
    const token = linkToken(link!.url)
    await auth.api.resetPassword({ body: { newPassword: password, token } })

    await expect(
      auth.api.resetPassword({ body: { newPassword: "another one", token } })
    ).rejects.toThrow()
  })

  test("signs the user out everywhere when the password is reset", async () => {
    await setPassword()
    await signIn(password)
    expect(await db.$count(session)).toBe(1)

    await setPassword("a brand new password")

    expect(await db.$count(session)).toBe(0)
  })

  test("rejects passwords shorter than 8 characters", async () => {
    const link = await requestLink()

    await expect(
      auth.api.resetPassword({
        body: { newPassword: "short", token: linkToken(link!.url) },
      })
    ).rejects.toThrow()
  })
})

describe("password sign-in", () => {
  test("signs in with the chosen password", async () => {
    await setPassword()

    const result = await signIn(password)
    expect(result.user.email).toBe(email)
  })

  test("rejects a wrong password", async () => {
    await setPassword()

    await expect(signIn("wrong password")).rejects.toThrow()
  })

  test("rejects users who haven't chosen a password yet", async () => {
    await expect(signIn(password)).rejects.toThrow()
  })

  test("public sign-up stays disabled", async () => {
    await expect(
      auth.api.signUpEmail({
        body: { email: "new@example.com", password, name: "New" },
      })
    ).rejects.toThrow()
  })
})

describe("one-time code sign-in", () => {
  async function signInWithCode() {
    await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } })
    const { otp } = outbox.codes.at(-1)!
    return auth.api.signInEmailOTP({ body: { email, otp } })
  }

  test("still works for users without a password", async () => {
    expect((await signInWithCode()).user.email).toBe(email)
  })

  test("still works after choosing a password", async () => {
    await setPassword()

    expect((await signInWithCode()).user.email).toBe(email)
  })
})
