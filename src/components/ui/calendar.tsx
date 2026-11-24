"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  showOutsideDays = true,
  style,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-background text-foreground", className)}
      style={
        {
          "--rdp-accent-color": "var(--primary)",
          "--rdp-accent-background-color": "var(--muted)",
          "--rdp-range_start-color": "var(--primary-foreground)",
          "--rdp-range_end-color": "var(--primary-foreground)",
          "--rdp-range_middle-color": "var(--foreground)",
          "--rdp-today-color": "var(--primary)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
