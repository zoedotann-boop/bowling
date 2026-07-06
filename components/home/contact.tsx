"use client"

import { useState } from "react"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { cn } from "@/lib/utils"
import { Container } from "./container"

const TOPICS = [
  "בירור כללי",
  "הזמנת מסלול",
  "יום הולדת",
  "אירוע פרטי",
  "הצעת שיפור",
]

const INFO = [
  { icon: MapPin, title: "הכתובת שלנו", value: "אבא הלל 301, ר״ג" },
  { icon: Mail, title: "האימייל שלנו", value: "info@bowling.co.il" },
  { icon: Phone, title: "הטלפון שלנו", value: "03-5700834" },
  { icon: MessageCircle, title: "לשיחת ווצאפ", value: "תשובה מהירה" },
]

const inputClass =
  "rounded-xl border-[3px] border-navy bg-paper px-4 py-3 text-[15px] font-semibold text-navy placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-marigold lg:py-3.5"

export function Contact() {
  const [topic, setTopic] = useState(TOPICS[0])

  return (
    <section className="mt-6 border-t-[4px] border-navy bg-teal py-8 lg:mt-14 lg:py-16">
      <Container>
        <div className="mb-6 text-center lg:mb-9">
          <span className="font-mono text-xs font-bold text-orange lg:text-sm">
            משאירים לנו הודעה — נחזור אליכם בימי הפעילות
          </span>
          <h2 className="mt-1.5 font-heading text-[38px] font-black tracking-[-1px] text-cream-warm lg:text-[52px]">
            צרו קשר
          </h2>
          <div className="mx-auto mt-3 h-[7px] w-[70px] rounded-full bg-rust lg:w-20" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          {INFO.map(({ icon: Icon, title, value }) => (
            <div
              key={title}
              className="rounded-[16px] border-[4px] border-dashed border-orange bg-cream-warm p-4 lg:rounded-[18px] lg:p-5"
            >
              <Icon className="size-5 text-rust" strokeWidth={2.5} />
              <div className="mt-1.5 font-heading text-[15px] font-extrabold text-navy lg:mt-2 lg:text-base">
                {title}
              </div>
              <div className="text-[13px] font-semibold text-mud lg:text-sm">
                {value}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-[20px] border-[4px] border-dashed border-orange bg-cream-warm p-[22px] lg:rounded-[22px] lg:p-8"
        >
          <div className="mb-4 font-heading text-[21px] font-black text-navy lg:mb-5 lg:text-2xl">
            שלחו לנו הודעה
          </div>
          <div className="mb-3.5 flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3.5">
            <input type="text" placeholder="שם מלא" className={inputClass} />
            <input
              type="tel"
              placeholder="טלפון · 050-0000000"
              className={inputClass}
            />
          </div>
          <div className="mb-2 text-sm font-bold text-navy">נושא הפנייה</div>
          <div className="mb-3.5 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={cn(
                  "rounded-full border-[3px] border-navy px-3.5 py-1.5 text-[12.5px] font-extrabold transition-colors lg:px-4 lg:py-2 lg:text-[13px]",
                  topic === t ? "bg-rust text-paper" : "bg-paper text-navy"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            placeholder="ספרו מה תרצו לדעת…"
            className={cn(
              inputClass,
              "mb-3.5 h-[88px] w-full resize-none lg:h-24"
            )}
          />
          <button
            type="submit"
            className="w-full rounded-full border-[3px] border-navy bg-rust px-5 py-3.5 font-heading text-[17px] font-black text-paper transition-colors hover:bg-navy lg:py-4 lg:text-lg"
          >
            שלחו הודעה
          </button>
        </form>
      </Container>
    </section>
  )
}
