"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DebtSnapshot } from "../utils/debtTimelineCalculations";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Clock, DollarSign, History } from "lucide-react";

interface DebtBalanceMetricsCardProps {
  snapshot: DebtSnapshot;
  cutoffDateStr: string;
  isTodayCutoff: boolean;
  typeFilter: "all" | "payable" | "receivable";
}

export function DebtBalanceMetricsCard({
  snapshot,
  cutoffDateStr,
  isTodayCutoff,
  typeFilter,
}: DebtBalanceMetricsCardProps) {
  const formattedCutoff = new Date(cutoffDateStr + "T00:00:00").toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Encabezado con estado temporal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Balance y Amortización Acumulada
            </h3>
            <p className="text-xs text-muted-foreground">
              Métricas calculadas con todas las deudas y abonos registrados hasta la fecha seleccionada
            </p>
          </div>
          <div>
            {isTodayCutoff ? (
              <Badge variant="default" className="text-xs gap-1 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Al día de hoy
              </Badge>
            ) : (
              <Badge variant="warning" className="text-xs gap-1 py-1">
                <History className="w-3.5 h-3.5" />
                Foto al {formattedCutoff}
              </Badge>
            )}
          </div>
        </div>

        {/* 3 KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Total Contraído */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Contraído</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${formatCurrency(snapshot.totalOriginal)}
            </div>
            <div className="text-xs text-muted-foreground">
              {snapshot.items.length} compromiso(s) registrado(s)
            </div>
          </div>

          {/* 2. Total Pagado / Amortizado */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Total Amortizado (Pagado)
              </span>
              <Badge variant="success" className="text-xs font-bold px-1.5 py-0.5">
                {snapshot.paidPercentage}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${formatCurrency(snapshot.totalPaid)}
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-emerald-950/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, snapshot.paidPercentage)}%` }}
              />
            </div>
          </div>

          {/* 3. Saldo Pendiente */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Saldo Pendiente
              </span>
              <Badge variant="danger" className="text-xs font-bold px-1.5 py-0.5">
                {snapshot.pendingPercentage}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${formatCurrency(snapshot.totalPending)}
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-red-950/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, snapshot.pendingPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desglose adicional por Pagar y Cobrar si el filtro es 'all' */}
        {typeFilter === "all" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-muted-foreground border-t border-border/50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Por pagar a otros: <strong className="text-foreground">${formatCurrency(snapshot.totalPagar)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Por cobrar a otros: <strong className="text-foreground">${formatCurrency(snapshot.totalCobrar)}</strong></span>
              </div>
            </div>
            <span className="italic">
              * Haz clic en cualquier punto del gráfico de evolución para cambiar la fecha de corte
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
