"use client";

import { useState, useMemo } from "react";
import { useGetDebts } from "../hooks/useDebts";
import { parseLocalDate } from "@/lib/utils";
import {
  calculateDebtSnapshotAtDate,
  generateDebtTimeSeries,
} from "../utils/debtTimelineCalculations";
import { DebtChartsFilterBar } from "./DebtChartsFilterBar";
import { DebtBalanceMetricsCard } from "./DebtBalanceMetricsCard";
import { DebtEvolutionChart } from "./DebtEvolutionChart";
import { DebtEntityBarChart } from "./DebtEntityBarChart";
import { DebtLiquidationDonutChart } from "./DebtLiquidationDonutChart";

export function AdvancedDebtCharts() {
  const { data: debts, isLoading } = useGetDebts();

  // Fecha actual como string "YYYY-MM-DD"
  const todayStr = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  // Estados de filtrado y corte temporal
  const [typeFilter, setTypeFilter] = useState<"all" | "payable" | "receivable">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [rangeFilter, setRangeFilter] = useState<"30d" | "90d" | "this_year" | "all">("all");
  const [cutoffDateStr, setCutoffDateStr] = useState<string>(todayStr);

  const isTodayCutoff = cutoffDateStr === todayStr;

  // Foto acumulada calculada para la fecha de corte seleccionada
  const cutoffDate = useMemo(() => parseLocalDate(cutoffDateStr), [cutoffDateStr]);

  const snapshot = useMemo(() => {
    if (!debts) {
      return {
        totalOriginal: 0,
        totalPaid: 0,
        totalPending: 0,
        paidPercentage: 0,
        pendingPercentage: 0,
        totalPagar: 0,
        totalCobrar: 0,
        items: [],
      };
    }
    return calculateDebtSnapshotAtDate(debts, cutoffDate, typeFilter, statusFilter);
  }, [debts, cutoffDate, typeFilter, statusFilter]);

  // Serie de tiempo para el gráfico de evolución interactivo
  const timeSeries = useMemo(() => {
    if (!debts) return [];
    return generateDebtTimeSeries(debts, typeFilter, statusFilter, rangeFilter);
  }, [debts, typeFilter, statusFilter, rangeFilter]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse text-sm">
        Cargando análisis avanzado de deudas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Barra de Filtros y Control de Corte Temporal */}
      <DebtChartsFilterBar
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        rangeFilter={rangeFilter}
        onRangeFilterChange={setRangeFilter}
        cutoffDateStr={cutoffDateStr}
        onCutoffDateChange={setCutoffDateStr}
        onResetToToday={() => setCutoffDateStr(todayStr)}
        isTodayCutoff={isTodayCutoff}
      />

      {/* 2. Métricas de Balance y Porcentaje Detallado de Amortización */}
      <DebtBalanceMetricsCard
        snapshot={snapshot}
        cutoffDateStr={cutoffDateStr}
        isTodayCutoff={isTodayCutoff}
        typeFilter={typeFilter}
      />

      {/* 3. Gráfico Interactivo de Evolución Temporal */}
      <DebtEvolutionChart
        data={timeSeries}
        cutoffDateStr={cutoffDateStr}
        onSelectCutoffDate={(dateKey) => setCutoffDateStr(dateKey)}
      />

      {/* 4. Gráficos de Balance por Entidad y Proporción de Liquidación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DebtEntityBarChart
          items={snapshot.items}
          cutoffDateStr={cutoffDateStr}
        />
        <DebtLiquidationDonutChart
          totalPaid={snapshot.totalPaid}
          totalPending={snapshot.totalPending}
          totalOriginal={snapshot.totalOriginal}
          paidPercentage={snapshot.paidPercentage}
          pendingPercentage={snapshot.pendingPercentage}
          cutoffDateStr={cutoffDateStr}
        />
      </div>
    </div>
  );
}
