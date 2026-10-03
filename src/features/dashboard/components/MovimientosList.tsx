"use client";

import { useBalance } from "@/hooks/useBalance";
import { parseLocalDate, formatCurrency } from "@/lib/utils";
import { Wallet, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ITEMS_PER_PAGE = 8; // same as other pages

export function MovimientosList() {
  const { allMovimientos, isLoading } = useBalance();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "debt">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const filtered = useMemo(() => {
    if (!allMovimientos) return [];
    
    return allMovimientos.filter(mov => {
      const matchSearch = (mov.movName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (mov.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchFilter = true;
      if (filterType === "income") matchFilter = mov.movType === "income" || mov.movType === "debt_collect";
      if (filterType === "expense") matchFilter = mov.movType === "expense";
      if (filterType === "debt") matchFilter = mov.movType === "debt_pay"; 

      return matchSearch && matchFilter;
    });
  }, [allMovimientos, searchTerm, filterType]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedMovimientos = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">Cargando tu estado de cuenta...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Contenedor de Búsqueda y Filtros Unificado */}
      <div className="flex flex-col gap-4 bg-background p-1 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="relative w-full md:max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transacción..."
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-center justify-end gap-2">
            <select
              className="flex h-10 w-full sm:w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Todos</option>
              <option value="income">Entradas</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barra de Resultados y Limpiar Filtros */}
      <div className="flex justify-between items-center w-full min-h-[32px] my-2">
        <div>
          {(searchTerm !== "" || filterType !== "all") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setCurrentPage(1);
              }} 
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filtered.length} resultado(s)
        </div>
      </div>

      {/* Contenido */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <p className="text-muted-foreground">No se encontraron movimientos con esos filtros.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {/* --- VISTA DESKTOP (TABLA) --- */}
            <table className="w-full text-sm text-left hidden md:table">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Transacción</th>
                  <th className="px-6 py-4 font-medium">Descripción</th>
                  <th className="px-6 py-4 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {paginatedMovimientos.map((mov: any) => (
                  <tr key={mov.id + mov.movType} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {parseLocalDate(mov.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {mov.movName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {mov.description || "-"}
                    </td>
                    <td className={`px-6 py-4 font-bold text-right text-sm ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {mov.movType === 'income' || mov.movType === 'debt_collect' ? '+' : '-'}${formatCurrency(mov.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- VISTA MOBILE (LISTA DE TARJETAS) --- */}
            <div className="block md:hidden divide-y divide-border bg-background">
              {paginatedMovimientos.map((mov: any) => (
                <div key={mov.id + mov.movType} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {mov.movName}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 truncate mt-0.5">
                        <span>{parseLocalDate(mov.date).toLocaleDateString()}</span>
                        {mov.description && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                            <span className="truncate">{mov.description}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end pl-4">
                    <span className={`font-bold whitespace-nowrap text-base ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {mov.movType === 'income' || mov.movType === 'debt_collect' ? '+' : '-'}${formatCurrency(mov.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paginación unificada */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
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
