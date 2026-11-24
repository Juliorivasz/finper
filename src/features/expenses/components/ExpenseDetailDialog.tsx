import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, parseLocalDate } from "@/lib/utils"

interface ExpenseDetailDialogProps {
  expense: any | null
  onClose: () => void
}

export function ExpenseDetailDialog({ expense, onClose }: ExpenseDetailDialogProps) {
  return (
    <Dialog open={!!expense} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del Gasto</DialogTitle>
        </DialogHeader>
        {expense && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Categoría</span>
              <span className="font-semibold text-foreground">
                {expense.categories?.name || "General"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Tipo de Gasto</span>
              <span className="font-medium text-sm text-foreground">
                {expense.is_recurring ? "Recurrente mensual (Fijo)" : "Gasto puntual (Variable)"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Fecha</span>
              <span className="font-semibold text-foreground">
                {parseLocalDate(expense.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Monto</span>
              <span className="font-bold text-lg text-primary">
                ${formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="flex flex-col gap-2 pb-2">
              <span className="text-muted-foreground font-medium">Descripción</span>
              <p className="text-sm bg-muted/30 p-3 rounded-md text-foreground">
                {expense.description || "Sin descripción"}
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
