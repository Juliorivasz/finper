import { Trash2, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, parseLocalDate } from "@/lib/utils"

interface ExpenseMobileListProps {
  expenses: any[]
  onSelectExpense: (expense: any) => void
  onDeleteExpense: (id: string) => void
}

export function ExpenseMobileList({
  expenses,
  onSelectExpense,
  onDeleteExpense,
}: ExpenseMobileListProps) {
  return (
    <div className="block md:hidden divide-y divide-border bg-background">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => onSelectExpense(expense)}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">
                  {expense.categories?.name || "Categoría general"}
                </span>
                {expense.is_recurring && (
                  <Badge variant="muted" size="sm" className="gap-1 font-normal text-[10px] shrink-0">
                    <Repeat className="w-2.5 h-2.5 text-primary" />
                    Fijo
                  </Badge>
                )}
              </div>
              {expense.description && (
                <span className="text-sm text-muted-foreground truncate mt-0.5">
                  {expense.description}
                </span>
              )}
            </div>
            <span className="font-bold text-foreground whitespace-nowrap text-right">
              ${formatCurrency(expense.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              {parseLocalDate(expense.date).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteExpense(expense.id)
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
