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
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-background text-foreground", className)}
      // Podríamos sobreescribir estilos si quisiéramos aquí, 
      // pero el style.css por defecto de react-day-picker es muy limpio.
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
