import { History, HandCoins, Trash2 } from "lucide-react"
import { formatDistanceStrict } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table"
import { formatCurrency, parseLocalDate } from "@/lib/utils"
import { Debt } from "../hooks/useDebts"

export type ProcessedDebt = Debt & {
  debt_payments: any[]
  paid: number
  pending: number
  originalPending: number
  interestAmount: number
  daysLate: number
}

interface DebtTableProps {
  debts: ProcessedDebt[]
  today: Date
  onViewHistory: (debt: ProcessedDebt) => void
  onPayDebt: (debt: ProcessedDebt) => void
  onDeleteDebt: (id: string) => void
}

export function DebtTable({
  debts,
  today,
  onViewHistory,
  onPayDebt,
  onDeleteDebt,
}: DebtTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Descripción</TableHead>
            <TableHead className="px-6 py-4">Estado</TableHead>
            <TableHead className="px-6 py-4 text-right">Original</TableHead>
            <TableHead className="px-6 py-4 text-right text-primary">Pendiente</TableHead>
            <TableHead className="px-6 py-4 text-center w-36">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.map((debt) => {
            const isOverdue =
              debt.pending > 0 && debt.due_date && parseLocalDate(debt.due_date) < today

            return (
              <TableRow key={debt.id} className="group">
                <TableCell className="px-6 py-4 font-medium max-w-[220px] truncate">
                  <span className="text-foreground">{debt.description}</span>
                  <div className="text-xs mt-1 truncate flex items-center gap-1.5">
                    <span className="text-muted-foreground">
                      {debt.type === "payable" ? "Yo debo" : "Me deben"} •
                    </span>
                    <span className={isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"}>
                      {isOverdue
                        ? `Venció hace ${formatDistanceStrict(parseLocalDate(debt.due_date!), today, { locale: es })}`
                        : `Vence: ${debt.due_date ? parseLocalDate(debt.due_date).toLocaleDateString(undefined) : "S/F"}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {debt.pending <= 0 ? (
                    <Badge variant="success">Saldada</Badge>
                  ) : (
                    <Badge variant="warning">Pendiente</Badge>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 text-muted-foreground text-right">
                  ${formatCurrency(debt.amount)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end justify-center space-y-0.5">
                    <span className="font-bold text-primary text-sm">
                      ${formatCurrency(Math.max(0, debt.pending))}
                    </span>
                    {debt.interestAmount > 0 && (
                      <span className="text-[11px] text-red-500 font-medium">
                        +${formatCurrency(debt.interestAmount)} mora
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer"
                      onClick={() => onViewHistory(debt)}
                      title="Ver historial de abonos"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    {debt.pending > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                        onClick={() => onPayDebt(debt)}
                        title="Abonar a cuenta"
                      >
                        <HandCoins className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                      onClick={() => onDeleteDebt(debt.id)}
                      title="Eliminar registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
