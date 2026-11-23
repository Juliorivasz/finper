import { History, HandCoins, Trash2 } from "lucide-react"
import { formatDistanceStrict } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, parseLocalDate } from "@/lib/utils"
import { ProcessedDebt } from "./DebtTable"

interface DebtMobileListProps {
  debts: ProcessedDebt[]
  today: Date
  onViewHistory: (debt: ProcessedDebt) => void
  onPayDebt: (debt: ProcessedDebt) => void
  onDeleteDebt: (id: string) => void
}

export function DebtMobileList({
  debts,
  today,
  onViewHistory,
  onPayDebt,
  onDeleteDebt,
}: DebtMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {debts.map((debt) => {
        const isOverdue =
          debt.pending > 0 && debt.due_date && parseLocalDate(debt.due_date) < today

        return (
          <div key={debt.id} className="p-4 space-y-3 bg-card">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0 pr-2">
                <span className="font-semibold text-base text-foreground block truncate">
                  {debt.description}
                </span>
                <span className="text-sm flex flex-wrap gap-x-1 items-center mt-0.5 leading-tight">
                  <span className="text-muted-foreground">
                    {debt.type === "payable" ? "Yo debo" : "Me deben"} •
                  </span>
                  <span className={isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}>
                    {isOverdue
                      ? `Venció hace ${formatDistanceStrict(parseLocalDate(debt.due_date!), today, { locale: es })}`
                      : `Vence: ${debt.due_date ? parseLocalDate(debt.due_date).toLocaleDateString(undefined) : "S/F"}`}
                  </span>
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="font-bold text-primary whitespace-nowrap text-right text-lg leading-none">
                  ${formatCurrency(Math.max(0, debt.pending))}
                </span>
                {debt.interestAmount > 0 && (
                  <span className="text-[11px] text-red-500 font-medium mt-1">
                    +${formatCurrency(debt.interestAmount)} de mora
                  </span>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  de ${formatCurrency(debt.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              {debt.pending <= 0 ? (
                <Badge variant="success">Saldada</Badge>
              ) : (
                <Badge variant="warning">Pendiente</Badge>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-blue-500 cursor-pointer"
                  onClick={() => onViewHistory(debt)}
                >
                  <History className="h-4 w-4 mr-1" /> Abonos
                </Button>
                {debt.pending > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-primary cursor-pointer"
                    onClick={() => onPayDebt(debt)}
                  >
                    <HandCoins className="h-4 w-4 mr-1" /> Abonar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-red-500 cursor-pointer"
                  onClick={() => onDeleteDebt(debt.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
