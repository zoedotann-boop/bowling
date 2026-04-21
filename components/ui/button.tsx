import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-none border-2 border-ink font-bold whitespace-nowrap",
    "transition-transform duration-100 ease-out outline-none select-none",
    "active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-[0_1px_0_var(--ink)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-red-2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-red text-white shadow-btn-red",
        secondary: "bg-turq text-white shadow-btn-turq",
        destructive: "bg-red-2 text-white shadow-btn-ink",
        outline: "bg-cream text-ink shadow-btn-ink",
        ghost:
          "border-transparent bg-transparent text-ink shadow-none hover:bg-cream-2 active:not-aria-[haspopup]:translate-y-0 active:not-aria-[haspopup]:shadow-none",
        link: "border-transparent bg-transparent text-red underline-offset-4 shadow-none hover:underline active:not-aria-[haspopup]:translate-y-0 active:not-aria-[haspopup]:shadow-none",
      },
      size: {
        default: "h-10 px-4 text-sm",
        xs: "h-7 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      nativeButton={nativeButton ?? render === undefined}
      {...props}
    />
  )
}

export { Button, buttonVariants }
