import NumberFlow from "@number-flow/react"

interface ExpenseSummaryCardProps {
  gastosMes: number
  balanceTotal: number
  isBalanceLoading: boolean
}

export function ExpenseSummaryCard({
  gastosMes,
  balanceTotal,
  isBalanceLoading,
}: ExpenseSummaryCardProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center bg-card p-4 rounded-xl border border-border shadow-sm gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-muted/30 p-3 rounded-lg w-full sm:w-auto">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Gastos del mes
          </span>
          <span className="text-xl font-bold text-red-500">
            {isBalanceLoading ? (
              "..."
            ) : (
              <NumberFlow
                value={gastosMes}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
              />
            )}
          </span>
        </div>
        <div className="hidden sm:block w-px bg-border" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Balance Total
          </span>
          <span
            className={`text-xl font-bold ${
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
        </div>
      </div>
    </div>
  )
}
