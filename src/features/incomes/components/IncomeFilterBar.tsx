import Link from "next/link"
import { Search, PieChart as PieChartIcon, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface IncomeFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateRange: { from: Date | undefined; to: Date | undefined }
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  onClearFilters: () => void
  resultsCount: number
}

export function IncomeFilterBar({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  resultsCount,
}: IncomeFilterBarProps) {
  const hasActiveFilters = searchTerm !== "" || dateRange.from !== undefined

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        {/* Search */}
        <div className="relative w-full md:max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción o categoría..."
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Action and Date Filter */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-center justify-end gap-2">
          <Link href="/ingresos/charts" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2 cursor-pointer">
              <PieChartIcon className="h-4 w-4" />
              Gráficos
            </Button>
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[260px] justify-start text-left font-normal bg-background cursor-pointer"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd", { locale: es })} -{" "}
                      {format(dateRange.to, "LLL dd", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd", { locale: es })
                  )
                ) : (
                  <span className="text-muted-foreground">Filtrar por fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 max-w-[calc(100vw-20px)]"
              align="center"
              collisionPadding={10}
            >
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) =>
                  onDateRangeChange({ from: range?.from, to: range?.to })
                }
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Counters & Reset */}
      <div className="flex justify-between items-center w-full min-h-[32px] pt-1">
        <div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {resultsCount} resultado(s)
        </span>
      </div>
    </div>
  )
}
