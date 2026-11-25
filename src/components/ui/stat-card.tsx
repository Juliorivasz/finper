import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const statCardVariants = cva(
  "p-6 rounded-xl border shadow-sm flex items-center justify-between transition-all",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        danger: "border-red-500/20 bg-red-500/10 text-foreground",
        success: "border-green-500/20 bg-green-500/10 text-foreground",
        warning: "border-yellow-500/20 bg-yellow-500/10 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string
  amount: string | React.ReactNode
  icon?: React.ReactNode
  subtitle?: string
}

export function StatCard({
  className,
  variant,
  title,
  amount,
  icon,
  subtitle,
  ...props
}: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)} {...props}>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{amount}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
    </div>
  )
}
