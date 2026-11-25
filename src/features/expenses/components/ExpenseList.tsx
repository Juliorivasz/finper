"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { parseLocalDate } from "@/lib/utils";
import { useBalance } from "@/hooks/useBalance";
import { useGetExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { ExpenseSummaryCard } from "./ExpenseSummaryCard";
import { ExpenseFilterBar } from "./ExpenseFilterBar";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseMobileList } from "./ExpenseMobileList";
import { ExpenseDetailDialog } from "./ExpenseDetailDialog";
import { ExpenseDeleteDialog } from "./ExpenseDeleteDialog";

const ITEMS_PER_PAGE = 8;

export function ExpenseList() {
  const { data: expenses, isLoading } = useGetExpenses();
  const { gastosMes, balanceTotal, isLoading: isBalanceLoading } = useBalance();
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

  // Modales
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);

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

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    return expenses.filter((exp) => {
      const lowerTerm = searchTerm.toLowerCase();
      const descMatch = exp.description?.toLowerCase().includes(lowerTerm);
      const catMatch = (exp as any).categories?.name?.toLowerCase().includes(lowerTerm);
      const textMatches = !searchTerm || descMatch || catMatch;

      const expDate = parseLocalDate(exp.date);
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

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE));
  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredExpenses, currentPage]);

  const confirmDelete = () => {
    if (!expenseToDelete) return;

    deleteExpense(expenseToDelete, {
      onSuccess: () => {
        toast.success("Gasto eliminado correctamente");
        setExpenseToDelete(null);
        if (paginatedExpenses.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
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
      {/* Resumen KPI */}
      <ExpenseSummaryCard
        gastosMes={gastosMes}
        balanceTotal={balanceTotal}
        isBalanceLoading={isBalanceLoading}
      />

      {/* Diálogos */}
      <ExpenseDeleteDialog
        expenseId={expenseToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setExpenseToDelete(null)}
      />

      <ExpenseDetailDialog
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Filtros */}
      <ExpenseFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={() => {
          setSearchTerm("");
          setDateRange({ from: undefined, to: undefined });
        }}
        resultsCount={filteredExpenses.length}
      />

      {/* Listado y Estados Vacíos */}
      {!expenses || expenses.length === 0 ? (
        <EmptyState title="No tienes gastos registrados aún" description="Registra tus consumos usando el botón '+'." />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState title="No se encontraron gastos" description="Prueba modificando tus términos de búsqueda o rango de fechas." />
      ) : (
        <Card className="overflow-hidden">
          <ExpenseTable
            expenses={paginatedExpenses}
            onSelectExpense={setSelectedExpense}
            onDeleteExpense={setExpenseToDelete}
          />
          <ExpenseMobileList
            expenses={paginatedExpenses}
            onSelectExpense={setSelectedExpense}
            onDeleteExpense={setExpenseToDelete}
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
