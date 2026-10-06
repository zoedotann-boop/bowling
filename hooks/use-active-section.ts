import { useEffect, useState } from "react"

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("")
  const key = ids.join(" ")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: "-25% 0px -70% 0px" }
    )
    for (const id of key.split(" ")) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [key])

  return [ids.includes(active) ? active : (ids[0] ?? ""), setActive] as const
}
