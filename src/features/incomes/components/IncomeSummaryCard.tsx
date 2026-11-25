import NumberFlow from "@number-flow/react";
import { IncomeAverageMetrics } from "../utils/incomeCalculations";

interface IncomeSummaryCardProps {
  ingresosMes: number;
  balanceTotal: number;
  isBalanceLoading: boolean;
  isFiltered?: boolean;
  rangeMetrics?: IncomeAverageMetrics;
}

export function IncomeSummaryCard({
  ingresosMes,
  balanceTotal,
  isBalanceLoading,
  isFiltered = false,
  rangeMetrics,
}: IncomeSummaryCardProps) {
  const displayTotal = isFiltered && rangeMetrics ? rangeMetrics.total : ingresosMes;
  const showAverages = isFiltered && rangeMetrics && rangeMetrics.count > 0;

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/20 p-3.5 rounded-lg border border-border/60">
        {/* Total Ingresos */}
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
            {isFiltered ? "Ingresos del Periodo" : "Ingresos del Mes"}
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-500 mt-0.5">
            {isBalanceLoading ? (
              "..."
            ) : (
              <NumberFlow
                value={displayTotal}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
              />
            )}
          </span>
          {showAverages && (
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {rangeMetrics.count} cobro(s)
            </span>
          )}
        </div>

        {/* Promedio Mensual (Salario Promedio) */}
        <div className="flex flex-col border-l border-border/70 pl-3 sm:pl-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
            Promedio Mensual
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
            {isBalanceLoading || !showAverages ? (
              "—"
            ) : (
              <NumberFlow
                value={rangeMetrics.monthlyAverage}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
              />
            )}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {showAverages ? `~${rangeMetrics.monthsCount} mes(es)` : "Filtra por fecha"}
          </span>
        </div>

        {/* Promedio por Cobro */}
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-border/70 pt-2 sm:pt-0 sm:pl-4 col-span-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
            Promedio por Cobro
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
            {isBalanceLoading || !showAverages ? (
              "—"
            ) : (
              <NumberFlow
                value={rangeMetrics.averagePerTransaction}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
              />
            )}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
            Ticket promedio
          </span>
        </div>

        {/* Balance Total */}
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-border/70 pt-2 sm:pt-0 sm:pl-4 col-span-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
            Balance Total
          </span>
          <span
            className={`text-lg sm:text-xl font-bold mt-0.5 ${
              balanceTotal > 0
                ? "text-emerald-500"
                : balanceTotal < 0
                ? "text-red-500"
                : "text-foreground"
            }`}
          >
            {isBalanceLoading ? (
              "..."
            ) : (
              <NumberFlow
                value={balanceTotal}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
              />
            )}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            Disponible neto
          </span>
        </div>
      </div>
    </div>
  );
}

