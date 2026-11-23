import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors border",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        success: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
        warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        danger: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        muted: "border-border bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}
