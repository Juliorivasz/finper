"use client";

import { useState, useMemo } from "react";
import { useGetDebts, useDeleteDebt, Debt } from "../hooks/useDebts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2, ArrowUpRight, ArrowDownRight, Plus, HandCoins, ChevronLeft, ChevronRight, History } from "lucide-react";
import { toast } from "sonner";
import { DebtForm } from "./DebtForm";
import { PaymentForm } from "./PaymentForm";

const ITEMS_PER_PAGE = 8; // Máximo 8 por página para móvil

export function DebtList() {
  const { data: debts, isLoading } = useGetDebts();
  const { mutate: deleteDebt, isPending: isDeleting } = useDeleteDebt();
  
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  
  const [debtToPay, setDebtToPay] = useState<{ id: string; pendingAmount: number } | null>(null);
  const [debtHistoryToView, setDebtHistoryToView] = useState<Debt & { paid: number, pending: number } | null>(null);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular totales sumando pagos
  const processedDebts = useMemo(() => {
    if (!debts) return [];
    
    return debts.map(debt => {
      // Ordenar pagos por fecha desc (más reciente primero)
      const sortedPayments = [...(debt.debt_payments || [])].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const paid = sortedPayments.reduce((sum, p) => sum + p.amount, 0);
      const pending = debt.amount - paid;
      return { ...debt, debt_payments: sortedPayments, paid, pending };
    });
  }, [debts]);

  const { porPagar, porCobrar } = processedDebts.reduce(
    (acc, debt) => {
      if (debt.type === "payable") acc.porPagar += debt.pending;
      else acc.porCobrar += debt.pending;
      return acc;
    },
    { porPagar: 0, porCobrar: 0 }
  );

  // Lógica de Paginación
  const totalPages = Math.ceil(processedDebts.length / ITEMS_PER_PAGE);
  const paginatedDebts = processedDebts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmDelete = () => {
    if (!debtToDelete) return;
    deleteDebt(debtToDelete, {
      onSuccess: () => {
        toast.success("Deuda eliminada correctamente");
        setDebtToDelete(null);
        // Si borramos el último elemento de la página, regresamos una
        if (paginatedDebts.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      },
      onError: (err) => {
        toast.error(`Error al eliminar: ${err.message}`);
        setDebtToDelete(null);
      },
    });
  };

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">Cargando tus deudas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <Dialog open={!!debtToDelete} onOpenChange={(open) => !open && setDebtToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar registro de deuda?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Esta acción no se puede deshacer y borrará el historial de esta deuda permanentemente.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDebtToDelete(null)}>Cancelar</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Sí, eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={!!debtToPay} onOpenChange={(open) => !open && setDebtToPay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonar a la deuda</DialogTitle>
          </DialogHeader>
          {debtToPay && (
             <PaymentForm 
               debtId={debtToPay.id} 
               maxAmount={debtToPay.pendingAmount} 
               onSuccessCallback={() => setDebtToPay(null)} 
             />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment History Modal */}
      <Dialog open={!!debtHistoryToView} onOpenChange={(open) => !open && setDebtHistoryToView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Abonos</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border">
              <span className="text-sm font-medium">{debtHistoryToView?.description}</span>
              <span className="text-sm text-primary font-bold">Total Abonado: ${debtHistoryToView?.paid.toFixed(2)}</span>
            </div>
            
            {(!debtHistoryToView?.debt_payments || debtHistoryToView.debt_payments.length === 0) ? (
              <p className="text-sm text-center text-muted-foreground py-6">No hay abonos registrados para esta deuda.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {debtHistoryToView.debt_payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center bg-background p-3 rounded-md border border-border">
                    <span className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                    </span>
                    <span className="font-bold text-foreground">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex items-center justify-between bg-red-500/10 border-red-500/20">
          <div>
            <p className="text-sm font-medium text-red-500 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" /> Yo debo (Por Pagar)
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">${porPagar.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center justify-between bg-green-500/10 border-green-500/20">
          <div>
            <p className="text-sm font-medium text-green-500 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4" /> Me deben (Por Cobrar)
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">${porCobrar.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Registro Detallado</h2>
        <Dialog open={isNewDebtModalOpen} onOpenChange={setIsNewDebtModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Registrar Deuda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar una Deuda</DialogTitle>
            </DialogHeader>
            <DebtForm onSuccessCallback={() => setIsNewDebtModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {processedDebts.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <p className="text-muted-foreground">No tienes deudas registradas.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {/* --- VISTA DESKTOP (TABLA) --- */}
            <table className="w-full text-sm text-left hidden md:table">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Descripción</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Original</th>
                  <th className="px-6 py-4 font-medium text-right text-primary">Pendiente</th>
                  <th className="px-6 py-4 font-medium text-center w-36">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {paginatedDebts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate text-sm">
                      {debt.description}
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {debt.type === "payable" ? "Yo debo" : "Me deben"} • Vence: {debt.due_date ? new Date(debt.due_date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'S/F'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {debt.pending <= 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Saldada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-right text-sm">
                      ${debt.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-bold text-right text-primary text-sm">
                      ${Math.max(0, debt.pending).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                          onClick={() => setDebtHistoryToView(debt)}
                          title="Ver historial de pagos"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        {debt.pending > 0 && (
                           <Button 
                             variant="outline" 
                             size="icon" 
                             className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                             onClick={() => setDebtToPay({ id: debt.id, pendingAmount: debt.pending })}
                             title="Abonar a cuenta"
                           >
                             <HandCoins className="h-4 w-4" />
                           </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => setDebtToDelete(debt.id)}
                          title="Eliminar deuda"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- VISTA MOBILE (LISTA DE TARJETAS) --- */}
            <div className="block md:hidden divide-y divide-border bg-background">
              {paginatedDebts.map((debt) => (
                <div key={debt.id} className="p-4 flex flex-col gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {debt.description}
                      </span>
                      <span className="text-sm text-muted-foreground truncate mt-0.5">
                        {debt.type === "payable" ? "Yo debo" : "Me deben"} • Vence: {debt.due_date ? new Date(debt.due_date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'S/F'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary whitespace-nowrap text-right text-lg leading-none">
                        ${Math.max(0, debt.pending).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        de ${debt.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {debt.pending <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">Saldada</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Pendiente</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 border border-border"
                        onClick={() => setDebtHistoryToView(debt)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      {debt.pending > 0 && (
                         <Button 
                           variant="outline" 
                           size="icon" 
                           className="h-8 w-8 text-primary hover:bg-primary/10"
                           onClick={() => setDebtToPay({ id: debt.id, pendingAmount: debt.pending })}
                         >
                           <HandCoins className="h-4 w-4" />
                         </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-border"
                        onClick={() => setDebtToDelete(debt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <span className="text-sm text-muted-foreground">
                Página <span className="font-medium text-foreground">{currentPage}</span> de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
