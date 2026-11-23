"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useBalance } from "@/hooks/useBalance";
import { parseLocalDate, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 8;

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

    return allMovimientos.filter((mov) => {
      const matchSearch =
        (mov.movName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mov.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      let matchFilter = true;
      if (filterType === "income")
        matchFilter = mov.movType === "income" || mov.movType === "debt_collect";
      if (filterType === "expense") matchFilter = mov.movType === "expense";
      if (filterType === "debt") matchFilter = mov.movType === "debt_pay";

      return matchSearch && matchFilter;
    });
  }, [allMovimientos, searchTerm, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedMovimientos = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filtered, currentPage]);

  const hasActiveFilters = searchTerm !== "" || filterType !== "all";

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">Cargando tu estado de cuenta...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="space-y-2">
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

          <div className="flex w-full md:w-auto items-center justify-end">
            <Select
              className="w-full sm:w-[160px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              options={[
                { value: "all", label: "Todos" },
                { value: "income", label: "Entradas" },
                { value: "expense", label: "Gastos" },
              ]}
            />
          </div>
        </div>

        {/* Contador y Limpiar */}
        <div className="flex justify-between items-center w-full min-h-[32px] pt-1">
          <div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4 mr-1" /> Limpiar filtros
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} resultado(s)
          </span>
        </div>
      </div>

      {/* Listado */}
      {!allMovimientos || allMovimientos.length === 0 ? (
        <EmptyState title="No hay movimientos registrados" description="Tus ingresos, gastos y abonos aparecerán aquí." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No se encontraron movimientos" description="Prueba con otros términos de búsqueda." />
      ) : (
        <Card className="overflow-hidden">
          {/* Vista Desktop (Tabla) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">Fecha</TableHead>
                  <TableHead className="px-6 py-4">Concepto</TableHead>
                  <TableHead className="px-6 py-4">Descripción</TableHead>
                  <TableHead className="px-6 py-4 text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovimientos.map((mov) => {
                  const isPositive = mov.movType === "income" || mov.movType === "debt_collect";

                  return (
                    <TableRow key={mov.id}>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {parseLocalDate(mov.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-sm flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isPositive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        <span className="truncate">{mov.movName}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground max-w-[200px] truncate text-sm">
                        {mov.description || "-"}
                      </TableCell>
                      <TableCell
                        className={`px-6 py-4 font-bold text-right text-sm ${
                          isPositive ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {isPositive ? "+" : "-"}${formatCurrency(mov.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Vista Mobile (Tarjetas) */}
          <div className="block md:hidden divide-y divide-border bg-background">
            {paginatedMovimientos.map((mov) => {
              const isPositive = mov.movType === "income" || mov.movType === "debt_collect";

              return (
                <div key={mov.id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isPositive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">
                          {mov.movName}
                        </span>
                        {mov.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {mov.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-bold whitespace-nowrap text-sm shrink-0 ${
                        isPositive ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {isPositive ? "+" : "-"}${formatCurrency(mov.amount)}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground pl-4.5">
                    {parseLocalDate(mov.date).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}
    </div>
  );
}
