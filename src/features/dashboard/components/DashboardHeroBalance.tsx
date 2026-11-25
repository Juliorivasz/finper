import NumberFlow from "@number-flow/react"

interface DashboardHeroBalanceProps {
  balanceTotal: number
  isLoading: boolean
}

export function DashboardHeroBalance({
  balanceTotal,
  isLoading,
}: DashboardHeroBalanceProps) {
  const isPositive = balanceTotal > 0
  const isNegative = balanceTotal < 0

  return (
    <div className="flex flex-col items-center justify-center bg-card p-8 rounded-2xl border border-border shadow-sm mb-2 relative overflow-hidden">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-blue-500" />
      <span className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Saldo Disponible
      </span>
      <div
        className={`text-5xl md:text-6xl font-extrabold tracking-tight ${
          isPositive
            ? "text-emerald-500"
            : isNegative
            ? "text-red-500"
            : "text-foreground"
        }`}
      >
        {isLoading ? (
          "..."
        ) : (
          <NumberFlow
            value={balanceTotal}
            locales="es-AR"
            format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
            animated={true}
          />
        )}
      </div>
    </div>
  )
}
