import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { formatCurrency, parseLocalDate } from "@/lib/utils"

interface ExpenseTableProps {
  expenses: any[]
  onSelectExpense: (expense: any) => void
  onDeleteExpense: (id: string) => void
}

export function ExpenseTable({
  expenses,
  onSelectExpense,
  onDeleteExpense,
}: ExpenseTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Fecha</TableHead>
            <TableHead className="px-6 py-4">Categoría</TableHead>
            <TableHead className="px-6 py-4">Descripción</TableHead>
            <TableHead className="px-6 py-4 text-right">Monto</TableHead>
            <TableHead className="px-6 py-4 text-center w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow
              key={expense.id}
              className="cursor-pointer group"
              onClick={() => onSelectExpense(expense)}
            >
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                {parseLocalDate(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-6 py-4 font-medium text-sm">
                {expense.categories?.name || "Categoría general"}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                {expense.description || "-"}
              </TableCell>
              <TableCell className="px-6 py-4 font-bold text-right text-sm">
                ${formatCurrency(expense.amount)}
              </TableCell>
              <TableCell
                className="px-6 py-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                  onClick={() => onDeleteExpense(expense.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
