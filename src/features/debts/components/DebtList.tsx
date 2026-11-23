"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { parseLocalDate, calculateOverdueInterest } from "@/lib/utils";
import { useGetDebts, useDeleteDebt } from "../hooks/useDebts";
import { DebtSummaryCards } from "./DebtSummaryCards";
import { DebtFilterBar } from "./DebtFilterBar";
import { DebtTable, ProcessedDebt } from "./DebtTable";
import { DebtMobileList } from "./DebtMobileList";
import { DebtPaymentHistoryDialog } from "./DebtPaymentHistoryDialog";
import { DebtPaymentDialog } from "./DebtPaymentDialog";
import { DebtDeleteDialog } from "./DebtDeleteDialog";

const ITEMS_PER_PAGE = 8;

export function DebtList() {
  const { data: debts, isLoading } = useGetDebts();
  const { mutate: deleteDebt, isPending: isDeleting } = useDeleteDebt();

  // Modales
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);
  const [debtToPay, setDebtToPay] = useState<{ id: string; pendingAmount: number } | null>(null);
  const [debtHistoryToView, setDebtHistoryToView] = useState<ProcessedDebt | null>(null);

  // Filtros y Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due_date_asc");

  // Procesamiento de datos de deuda e intereses
  const processedDebts = useMemo<ProcessedDebt[]>(() => {
    if (!debts) return [];

    return debts.map((debt) => {
      const sortedPayments = [...(debt.debt_payments || [])].sort(
        (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
      );
      const paid = sortedPayments.reduce((sum, p) => sum + p.amount, 0);
      const basePending = debt.amount - paid;

      let interest = 0;
      let finalPending = basePending;
      let daysLate = 0;

      if (basePending > 0) {
        const result = calculateOverdueInterest(basePending, debt.due_date, debt.interest_rate);
        interest = result.interestAmount;
        finalPending = result.totalAmount;
        daysLate = result.daysOverdue;
      }

      return {
        ...debt,
        debt_payments: sortedPayments,
        paid,
        pending: finalPending,
        originalPending: basePending,
        interestAmount: interest,
        daysLate,
      };
    });
  }, [debts]);

  // Filtro y ordenamiento
  const filteredAndSortedDebts = useMemo(() => {
    let result = [...processedDebts];

    if (typeFilter !== "all") {
      result = result.filter((d) => d.type === typeFilter);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((d) => d.description?.toLowerCase().includes(lower));
    }

    result.sort((a, b) => {
      const aIsPending = a.pending > 0;
      const bIsPending = b.pending > 0;
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;

      if (sortBy === "amount_desc") return b.pending - a.pending;
      if (sortBy === "amount_asc") return a.pending - b.pending;
      if (sortBy === "due_date_asc") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime();
      }
      if (sortBy === "created_desc") {
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      }
      return 0;
    });

    return result;
  }, [processedDebts, typeFilter, searchTerm, sortBy]);

  // Totales
  const { porPagar, porCobrar } = useMemo(() => {
    return processedDebts.reduce(
      (acc, debt) => {
        if (debt.type === "payable") acc.porPagar += debt.pending;
        else acc.porCobrar += debt.pending;
        return acc;
      },
      { porPagar: 0, porCobrar: 0 }
    );
  }, [processedDebts]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedDebts.length / ITEMS_PER_PAGE));
  const paginatedDebts = useMemo(() => {
    return filteredAndSortedDebts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredAndSortedDebts, currentPage]);

  const confirmDelete = () => {
    if (!debtToDelete) return;
    deleteDebt(debtToDelete, {
      onSuccess: () => {
        toast.success("Deuda eliminada correctamente");
        setDebtToDelete(null);
        if (paginatedDebts.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      },
      onError: (err) => {
        toast.error(`Error al eliminar: ${err.message}`);
        setDebtToDelete(null);
      },
    });
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">Cargando tus deudas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Diálogos modales desacoplados */}
      <DebtDeleteDialog
        debtId={debtToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDebtToDelete(null)}
      />

      <DebtPaymentDialog
        debtToPay={debtToPay}
        onClose={() => setDebtToPay(null)}
      />

      <DebtPaymentHistoryDialog
        debt={debtHistoryToView}
        onClose={() => setDebtHistoryToView(null)}
      />

      {/* Tarjetas KPI */}
      <DebtSummaryCards porPagar={porPagar} porCobrar={porCobrar} />

      {/* Filtros */}
      <DebtFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(val) => {
          setTypeFilter(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setCurrentPage(1);
        }}
        onClearFilters={() => {
          setSearchTerm("");
          setTypeFilter("all");
          setSortBy("due_date_asc");
          setCurrentPage(1);
        }}
        resultsCount={filteredAndSortedDebts.length}
      />

      {/* Contenido / Listado */}
      {processedDebts.length === 0 ? (
        <EmptyState title="No tienes deudas registradas" description="Usa el botón '+' para agregar una nueva deuda." />
      ) : filteredAndSortedDebts.length === 0 ? (
        <EmptyState title="No se encontraron deudas" description="Prueba modificando tus términos de búsqueda o filtros." />
      ) : (
        <Card className="overflow-hidden">
          <DebtTable
            debts={paginatedDebts}
            today={today}
            onViewHistory={setDebtHistoryToView}
            onPayDebt={(debt) => setDebtToPay({ id: debt.id, pendingAmount: debt.pending })}
            onDeleteDebt={setDebtToDelete}
          />
          <DebtMobileList
            debts={paginatedDebts}
            today={today}
            onViewHistory={setDebtHistoryToView}
            onPayDebt={(debt) => setDebtToPay({ id: debt.id, pendingAmount: debt.pending })}
            onDeleteDebt={setDebtToDelete}
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
