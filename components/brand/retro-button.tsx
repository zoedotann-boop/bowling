import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const retroButtonVariants = cva(
  [
    "group/retro-btn inline-flex shrink-0 items-center justify-center gap-2",
    "cursor-pointer rounded-lg font-bold whitespace-nowrap",
    "transition-transform duration-100 ease-out outline-none select-none",
    "active:translate-y-[3px] active:[box-shadow:0_1px_0_var(--ink)]",
    "focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-red/75",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      tone: {
        red: "bg-red text-white shadow-btn-red",
        turq: "bg-turq text-white shadow-btn-turq",
        yellow: "bg-yellow text-ink shadow-btn-yellow",
        ink: "bg-ink text-cream shadow-btn-ink",
        outline:
          "border-2 border-ink bg-cream text-ink shadow-btn-ink [box-shadow:0_4px_0_var(--ink)]",
      },
      size: {
        md: "h-11 px-4 text-sm",
        lg: "h-14 px-6 text-base",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      tone: "red",
      size: "md",
      full: false,
    },
  }
)

/**
 * RetroButton — chunky solid button with a colored hard-offset drop shadow.
 * Press state translates Y+3px and collapses the shadow, like a physical
 * key pressed into a slot. Used for public-site CTAs and admin actions.
 */
function RetroButton({
  className,
  tone,
  size,
  full,
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof retroButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="retro-button"
      className={cn(retroButtonVariants({ tone, size, full, className }))}
      render={render}
      nativeButton={nativeButton ?? render === undefined}
      {...props}
    />
  )
}

export { RetroButton, retroButtonVariants }
