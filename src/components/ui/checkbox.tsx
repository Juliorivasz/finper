import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const checkboxVariants = cva(
  "h-4 w-4 rounded border border-input bg-background text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-input",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(checkboxVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
