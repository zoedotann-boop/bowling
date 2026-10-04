import { describe, expect, test } from "bun:test"

import { bookingAnswers } from "./booking-answers"

describe("bookingAnswers", () => {
  test("names each answer with the label the form showed", () => {
    expect(
      bookingAnswers({
        field_a1b2c3: "12",
        labels: { field_a1b2c3: "מספר ילדים" },
      })
    ).toEqual([["מספר ילדים", "12"]])
  })

  test("falls back to the built-in names for the default fields", () => {
    expect(bookingAnswers({ event: "יום הולדת", firstName: "דנה" })).toEqual([
      ["אירוע", "יום הולדת"],
      ["שם פרטי", "דנה"],
    ])
  })

  test("uses the raw key only when nothing else is known", () => {
    expect(bookingAnswers({ child_count: "8" })).toEqual([["child_count", "8"]])
  })

  test("ignores blank labels and non-string label maps", () => {
    expect(bookingAnswers({ phone: "050", labels: { phone: "  " } })).toEqual([
      ["טלפון", "050"],
    ])
    expect(bookingAnswers({ phone: "050", labels: "oops" })).toEqual([
      ["טלפון", "050"],
    ])
  })

  test("skips reserved keys, blanks and non-string values", () => {
    expect(
      bookingAnswers({
        branch: "rishon",
        slug: "birthdays",
        signature: "data:image/png;base64,xx",
        labels: {},
        types: "date",
        email: "  ",
        agreed: true,
        lastName: "כהן",
      })
    ).toEqual([["שם משפחה", "כהן"]])
  })
})
