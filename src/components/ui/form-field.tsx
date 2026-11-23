import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1 min-w-0", className)} {...props}>
      {label && (
        <div className="flex justify-between items-center gap-1 min-w-0">
          <Label className="flex items-center gap-0.5 text-xs font-medium text-foreground truncate">
            <span className="truncate">{label}</span>
            {required && <span className="text-destructive shrink-0">*</span>}
          </Label>
          {hint && <span className="text-[11px] text-muted-foreground shrink-0">{hint}</span>}
        </div>
      )}
      {children}
      {error && (
        <p className="text-[11px] font-medium text-destructive leading-tight">
          {error}
        </p>
      )}
    </div>
  )
}
