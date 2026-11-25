import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DebtDeleteDialogProps {
  debtId: string | null
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DebtDeleteDialog({
  debtId,
  isDeleting,
  onConfirm,
  onClose,
}: DebtDeleteDialogProps) {
  return (
    <Dialog open={!!debtId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar registro de deuda?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            Esta acción no se puede deshacer y borrará el historial de pagos de esta deuda permanentemente.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="cursor-pointer">
            Cancelar
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Sí, eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
