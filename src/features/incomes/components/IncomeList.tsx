"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { parseLocalDate } from "@/lib/utils";
import { useBalance } from "@/hooks/useBalance";
import { useGetIncomes, useDeleteIncome } from "../hooks/useIncomes";
import { Income } from "../types";
import { calculateIncomeAverages } from "../utils/incomeCalculations";
import { IncomeSummaryCard } from "./IncomeSummaryCard";
import { IncomeFilterBar } from "./IncomeFilterBar";
import { IncomeTable } from "./IncomeTable";
import { IncomeMobileList } from "./IncomeMobileList";
import { IncomeDetailDialog } from "./IncomeDetailDialog";
import { IncomeDeleteDialog } from "./IncomeDeleteDialog";

const ITEMS_PER_PAGE = 8;

export function IncomeList() {
  const { data: incomes, isLoading } = useGetIncomes();
  const { ingresosMes, balanceTotal, isLoading: isBalanceLoading } = useBalance();
  const { mutate: deleteIncome, isPending: isDeleting } = useDeleteIncome();

  // Modales
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  const filteredIncomes = useMemo(() => {
    if (!incomes) return [];

    return incomes.filter((inc) => {
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

  const isFiltered = Boolean(dateRange.from || dateRange.to);
  const rangeMetrics = useMemo(
    () => calculateIncomeAverages(filteredIncomes, dateRange),
    [filteredIncomes, dateRange]
  );

  const totalPages = Math.max(1, Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE));
  const paginatedIncomes = useMemo(() => {
    return filteredIncomes.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredIncomes, currentPage]);

  const confirmDelete = () => {
    if (!incomeToDelete) return;

    deleteIncome(incomeToDelete, {
      onSuccess: () => {
        toast.success("Ingreso eliminado correctamente");
        setIncomeToDelete(null);
        if (paginatedIncomes.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
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
      {/* Resumen KPI */}
      <IncomeSummaryCard
        ingresosMes={ingresosMes}
        balanceTotal={balanceTotal}
        isBalanceLoading={isBalanceLoading}
        isFiltered={isFiltered}
        rangeMetrics={rangeMetrics}
      />

      {/* Diálogos */}
      <IncomeDeleteDialog
        incomeId={incomeToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setIncomeToDelete(null)}
      />

      <IncomeDetailDialog
        income={selectedIncome}
        onClose={() => setSelectedIncome(null)}
      />

      {/* Filtros */}
      <IncomeFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={() => {
          setSearchTerm("");
          setDateRange({ from: undefined, to: undefined });
        }}
        resultsCount={filteredIncomes.length}
      />

      {/* Listado y Estados Vacíos */}
      {!incomes || incomes.length === 0 ? (
        <EmptyState title="No tienes ingresos registrados aún" description="Registra tus cobros usando el botón '+'." />
      ) : filteredIncomes.length === 0 ? (
        <EmptyState title="No se encontraron ingresos" description="Prueba modificando tus términos de búsqueda o rango de fechas." />
      ) : (
        <Card className="overflow-hidden">
          <IncomeTable
            incomes={paginatedIncomes}
            onSelectIncome={setSelectedIncome}
            onDeleteIncome={setIncomeToDelete}
          />
          <IncomeMobileList
            incomes={paginatedIncomes}
            onSelectIncome={setSelectedIncome}
            onDeleteIncome={setIncomeToDelete}
          />
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
