import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, parseLocalDate } from "@/lib/utils"
import { Income } from "../types"

interface IncomeDetailDialogProps {
  income: Income | null
  onClose: () => void
}

export function IncomeDetailDialog({ income, onClose }: IncomeDetailDialogProps) {
  return (
    <Dialog open={!!income} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del Ingreso</DialogTitle>
        </DialogHeader>
        {income && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Categoría</span>
              <span className="font-semibold text-emerald-500">
                {income.category || "General"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Fecha</span>
              <span className="font-semibold text-foreground">
                {parseLocalDate(income.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground font-medium">Monto</span>
              <span className="font-bold text-lg text-emerald-500">
                ${formatCurrency(income.amount)}
              </span>
            </div>
            <div className="flex flex-col gap-2 pb-2">
              <span className="text-muted-foreground font-medium">Descripción</span>
              <p className="text-sm bg-muted/30 p-3 rounded-md text-foreground">
                {income.description || "Sin descripción"}
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
