import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, parseLocalDate } from "@/lib/utils"

interface DashboardRecentMovementsProps {
  movimientos: any[]
  isLoading: boolean
}

export function DashboardRecentMovements({
  movimientos,
  isLoading,
}: DashboardRecentMovementsProps) {
  return (
    <Card className="h-[350px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Últimos Movimientos</CardTitle>
        <Link href="/movimientos" className="text-xs text-primary hover:underline font-medium">
          Ver todos &rarr;
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-sm text-center mt-4">Cargando...</p>
        ) : movimientos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground text-sm">No hay movimientos recientes</p>
          </div>
        ) : (
          movimientos.map((mov: any) => {
            const isPositive = mov.movType === "income" || mov.movType === "debt_collect"

            return (
              <div
                key={mov.id}
                className="flex justify-between items-center p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg border border-border cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isPositive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {mov.movName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {parseLocalDate(mov.date).toLocaleDateString()}
                      {mov.description && (
                        <span className="ml-1 opacity-70">- {mov.description}</span>
                      )}
                    </p>
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
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
