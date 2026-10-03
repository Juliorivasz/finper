"use client";

import { useBalance } from "@/hooks/useBalance";
import { parseLocalDate, formatCurrency } from "@/lib/utils";
import { Wallet, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

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
      if (filterType === "debt") matchFilter = mov.movType === "debt_pay"; // o separar mejor

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-background p-1 rounded-lg">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transaccin..."
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide">
          <Button 
            variant={filterType === "all" ? "default" : "outline"} 
            onClick={() => setFilterType("all")}
            size="sm"
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          <Button 
            variant={filterType === "income" ? "default" : "outline"} 
            onClick={() => setFilterType("income")}
            size="sm"
            className="whitespace-nowrap"
          >
            Entradas
          </Button>
          <Button 
            variant={filterType === "expense" ? "default" : "outline"} 
            onClick={() => setFilterType("expense")}
            size="sm"
            className="whitespace-nowrap"
          >
            Gastos
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              No hay movimientos que coincidan con tu bsqueda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedMovimientos.map((mov: any) => (
              <div key={mov.id + mov.movType} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {mov.movName}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 truncate">
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
                  <span className={`font-bold whitespace-nowrap text-base sm:text-lg ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {mov.movType === 'income' || mov.movType === 'debt_collect' ? '+' : '-'}${formatCurrency(mov.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
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
      </div>
    </div>
  );
}
