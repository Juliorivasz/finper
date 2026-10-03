"use client";

import { useState, useMemo, useEffect } from "react";
import { useGetIncomes, useDeleteIncome } from "../hooks/useIncomes";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Trash2, Loader2, CalendarIcon, X, ChevronLeft, ChevronRight, Plus, PieChart as PieChartIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { es } from "date-fns/locale";
import Link from "next/link";

import { Income } from "../types";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { useBalance } from "@/hooks/useBalance";
import NumberFlow from "@number-flow/react";

const ITEMS_PER_PAGE = 8;

export function IncomeList() {
  const { data: incomes, isLoading } = useGetIncomes();
  const { ingresosMes, balanceTotal, isLoading: isBalanceLoading } = useBalance();
  const { mutate: deleteIncome, isPending: isDeleting } = useDeleteIncome();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  const filteredIncomes = useMemo(() => {
    if (!incomes) return [];
    
    return incomes.filter(inc => {
      const lowerTerm = searchTerm.toLowerCase();
      const descMatch = inc.description?.toLowerCase().includes(lowerTerm);
      const catMatch = inc.category?.toLowerCase().includes(lowerTerm);
      const textMatches = !searchTerm || descMatch || catMatch;

      const incDate = parseLocalDate(inc.date);
      incDate.setHours(0, 0, 0, 0);

      let isAfterStart = true;
      let isBeforeEnd = true;

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        isAfterStart = incDate >= fromDate;
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(0, 0, 0, 0);
        isBeforeEnd = incDate <= toDate;
      }

      return textMatches && isAfterStart && isBeforeEnd;
    });
  }, [incomes, searchTerm, dateRange]);

  const totalPages = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmDelete = () => {
    if (!incomeToDelete) return;
    
    deleteIncome(incomeToDelete, {
      onSuccess: () => {
        toast.success("Ingreso eliminado correctamente");
        setIncomeToDelete(null);
        if (paginatedIncomes.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      },
      onError: (err) => {
        toast.error(`Error al eliminar: ${err.message}`);
        setIncomeToDelete(null);
      },
    });
  };

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">Cargando tus ingresos...</div>;
  }

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center bg-card p-4 rounded-xl border border-border shadow-sm gap-4 mb-6">
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-muted/30 p-3 rounded-lg w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ingresos del mes</span>
              <span className="text-xl font-bold text-emerald-500">
                {isBalanceLoading ? "..." : <NumberFlow value={ingresosMes} locales="es-AR" format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} />}
              </span>
            </div>
            <div className="hidden sm:block w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Balance Total</span>
              <span className={`text-xl font-bold ${balanceTotal > 0 ? "text-emerald-500" : balanceTotal < 0 ? "text-red-500" : "text-foreground"}`}>
                {isBalanceLoading ? "..." : <NumberFlow value={balanceTotal} locales="es-AR" format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} />}
              </span>
            </div>
          </div>
        </div>

      <Dialog open={!!incomeToDelete} onOpenChange={(open) => !open && setIncomeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar ingreso?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Esta acción no se puede deshacer. El ingreso será eliminado permanentemente de tu historial.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIncomeToDelete(null)}>Cancelar</Button>
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

      <Dialog open={!!selectedIncome} onOpenChange={(open) => !open && setSelectedIncome(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Ingreso</DialogTitle>
          </DialogHeader>
          {selectedIncome && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground font-medium">Categoría</span>
                <span className="font-semibold text-emerald-500">{selectedIncome.category || "General"}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground font-medium">Fecha</span>
                <span className="font-semibold">{parseLocalDate(selectedIncome.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground font-medium">Monto</span>
                <span className="font-bold text-lg text-emerald-500">${formatCurrency(selectedIncome.amount)}</span>
              </div>
              <div className="flex flex-col gap-2 pb-2">
                <span className="text-muted-foreground font-medium">Descripción</span>
                <p className="text-sm bg-muted/30 p-3 rounded-md">{selectedIncome.description || "Sin descripción"}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedIncome(null)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 bg-background p-1 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="relative w-full md:max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-center justify-end gap-2">
          <Link href="/ingresos/charts" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <PieChartIcon className="h-4 w-4" />
              Gráficos
            </Button>
          </Link>
          
          

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
          {filteredIncomes.length} resultado(s)
        </div>
      </div>
    </div>

      {(!incomes || incomes.length === 0) ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <p className="text-muted-foreground">No tienes ingresos registrados aún.</p>
        </Card>
      ) : filteredIncomes.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <p className="text-muted-foreground">No se encontraron ingresos con esos filtros.</p>
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
                {paginatedIncomes.map((income) => (
                  <tr 
                    key={income.id} 
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedIncome(income)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {parseLocalDate(income.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">
                      {income.category || "General"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {income.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-right text-sm text-emerald-500">
                      ${formatCurrency(income.amount)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => setIncomeToDelete(income.id)}
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
              {paginatedIncomes.map((income) => (
                <div 
                  key={income.id} 
                  className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedIncome(income)}
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
                    <span className="font-bold whitespace-nowrap text-right text-emerald-500">
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
                      className="h-8 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIncomeToDelete(income.id);
                      }}
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 bg-background"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 bg-background"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
