import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const selectVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-input bg-background text-foreground",
        muted: "border-border bg-muted/30 text-foreground",
      },
      size: {
        default: "h-10 py-2 text-sm",
        sm: "h-9 py-1.5 px-2.5 text-xs sm:text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  options?: SelectOption[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, options, placeholder, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(selectVariants({ variant, size }), className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-background text-muted-foreground">
            {placeholder}
          </option>
        )}
        {options
          ? options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-background text-foreground"
              >
                {opt.label}
              </option>
            ))
          : children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }


