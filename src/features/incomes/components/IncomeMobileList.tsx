import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, parseLocalDate } from "@/lib/utils"
import { Income } from "../types"

interface IncomeMobileListProps {
  incomes: Income[]
  onSelectIncome: (income: Income) => void
  onDeleteIncome: (id: string) => void
}

export function IncomeMobileList({
  incomes,
  onSelectIncome,
  onDeleteIncome,
}: IncomeMobileListProps) {
  return (
    <div className="block md:hidden divide-y divide-border bg-background">
      {incomes.map((income) => (
        <div
          key={income.id}
          className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => onSelectIncome(income)}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground truncate">
                {income.category || "General"}
              </span>
              {income.description && (
                <span className="text-sm text-muted-foreground truncate mt-0.5">
                  {income.description}
                </span>
              )}
            </div>
            <span className="font-bold text-emerald-500 whitespace-nowrap text-right">
              ${formatCurrency(income.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              {parseLocalDate(income.date).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteIncome(income.id)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
