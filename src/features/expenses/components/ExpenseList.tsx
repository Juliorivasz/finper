"use client";

import { useState, useMemo, useEffect } from "react";
import { useGetExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Trash2, Loader2, CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ITEMS_PER_PAGE = 8; // Mostramos 8 por página para no saturar la pantalla móvil

export function ExpenseList() {
  const { data: expenses, isLoading } = useGetExpenses();
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();
  
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para el rango de fechas (usando react-day-picker)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Volver a la página 1 cada vez que cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter(exp => {
      // Filtro de texto
      const lowerTerm = searchTerm.toLowerCase();
      const descMatch = exp.description?.toLowerCase().includes(lowerTerm);
      const catMatch = (exp as any).categories?.name?.toLowerCase().includes(lowerTerm);
      const textMatches = !searchTerm || descMatch || catMatch;

      // Filtro de fechas con el calendario interactivo
      const expDate = new Date(exp.date);
      // Resetear horas para comparar días exactos
      expDate.setHours(0, 0, 0, 0);

      let isAfterStart = true;
      let isBeforeEnd = true;

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        isAfterStart = expDate >= fromDate;
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(0, 0, 0, 0);
        isBeforeEnd = expDate <= toDate;
      }

      return textMatches && isAfterStart && isBeforeEnd;
    });
  }, [expenses, searchTerm, dateRange]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmDelete = () => {
    if (!expenseToDelete) return;
    
    deleteExpense(expenseToDelete, {
      onSuccess: () => {
        toast.success("Gasto eliminado correctamente");
        setExpenseToDelete(null);
        // Si borramos el último elemento de la página, regresamos una
        if (paginatedExpenses.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      },
      onError: (err) => {
        toast.error(`Error al eliminar: ${err.message}`);
        setExpenseToDelete(null);
      },
    });
  };

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">Cargando tus gastos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Modal Personalizado de Confirmación */}
      <Dialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar gasto?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Esta acción no se puede deshacer. El gasto será eliminado permanentemente de tu historial.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExpenseToDelete(null)}>Cancelar</Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white" 
              onClick={confirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Sí, eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barra de Herramientas (Filtros y Búsqueda) */}
      <div className="flex flex-col gap-4 bg-background p-1 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por categoría o descripción..."
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-center justify-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[260px] justify-start text-left font-normal bg-background">
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
            {/* collisionPadding asegura que el calendario nunca se salga de la pantalla en móviles */}
            <PopoverContent className="w-auto p-0 max-w-[calc(100vw-20px)]" align="center" collisionPadding={10}>
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex justify-between items-center w-full min-h-[32px]">
        <div>
          {(searchTerm !== "" || dateRange.from !== undefined) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setDateRange({ from: undefined, to: undefined });
              }} 
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredExpenses.length} resultado(s)
        </div>
      </div>
    </div>

      {(!expenses || expenses.length === 0) ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <p className="text-muted-foreground">No tienes gastos registrados aún.</p>
        </Card>
      ) : filteredExpenses.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <p className="text-muted-foreground">No se encontraron gastos con esos filtros.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {/* --- VISTA DESKTOP (TABLA) --- */}
            <table className="w-full text-sm text-left hidden md:table">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Categoría</th>
                  <th className="px-6 py-4 font-medium">Descripción</th>
                  <th className="px-6 py-4 font-medium text-right">Monto</th>
                  <th className="px-6 py-4 font-medium text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">
                      {(expense as any).categories?.name || "Categoría general"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {expense.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-right text-sm">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => setExpenseToDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- VISTA MOBILE (LISTA DE TARJETAS) --- */}
            <div className="block md:hidden divide-y divide-border bg-background">
              {paginatedExpenses.map((expense) => (
                <div key={expense.id} className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {(expense as any).categories?.name || "Categoría general"}
                      </span>
                      {expense.description && (
                        <span className="text-sm text-muted-foreground truncate mt-0.5">
                          {expense.description}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-foreground whitespace-nowrap text-right">
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => setExpenseToDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
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
