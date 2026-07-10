"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// The venue has one canonical look: dark industrial neon. Force the dark theme
// so shadcn `dark:` variant utilities engage and there is no light mode.
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
