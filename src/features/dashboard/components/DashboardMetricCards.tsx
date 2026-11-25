import { ArrowDownToLine, Wallet, CreditCard, Scale } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface DashboardMetricCardsProps {
  totalEntradasMes: number
  totalSalidasMes: number
  deudaTotal: number
  deudaVencimientoTexto: string
  deudaVencimientoNombre: string
  entidadesConDeuda: number
  isLoadingIncomes: boolean
  isLoadingExpenses: boolean
  isLoadingDebts: boolean
}

export function DashboardMetricCards({
  totalEntradasMes,
  totalSalidasMes,
  deudaTotal,
  deudaVencimientoTexto,
  deudaVencimientoNombre,
  entidadesConDeuda,
  isLoadingIncomes,
  isLoadingExpenses,
  isLoadingDebts,
}: DashboardMetricCardsProps) {
  return (
    <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] *:min-w-[85%] *:sm:min-w-[45%] *:lg:min-w-0 *:shrink-0 *:snap-start">
      {/* Entradas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Entradas del Mes</CardTitle>
          <div className="p-2 bg-muted rounded-full">
            <ArrowDownToLine className="w-4 h-4 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex">
            {isLoadingIncomes || isLoadingDebts ? (
              "..."
            ) : (
              <NumberFlow
                value={totalEntradasMes}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
                animated={true}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ingresos + Cobros</p>
        </CardContent>
      </Card>

      {/* Salidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Salidas del Mes</CardTitle>
          <div className="p-2 bg-muted rounded-full">
            <Wallet className="w-4 h-4 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex">
            {isLoadingExpenses || isLoadingDebts ? (
              "..."
            ) : (
              <NumberFlow
                value={totalSalidasMes}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
                animated={true}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Gastos + Pagos de Deudas</p>
        </CardContent>
      </Card>

      {/* Deuda Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Deuda Total Pendiente</CardTitle>
          <div className="p-2 bg-muted rounded-full">
            <CreditCard className="w-4 h-4 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex">
            {isLoadingDebts ? (
              "..."
            ) : (
              <NumberFlow
                value={deudaTotal}
                locales="es-AR"
                format={{ style: "currency", currency: "ARS", minimumFractionDigits: 2 }}
                animated={true}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {entidadesConDeuda === 0
              ? "Sin compromisos"
              : `${entidadesConDeuda} registro(s) por pagar`}
          </p>
        </CardContent>
      </Card>

      {/* Próximo Vencimiento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Vencimiento</CardTitle>
          <div className="p-2 bg-muted rounded-full">
            <Scale className="w-4 h-4 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold truncate">
            {isLoadingDebts ? "..." : deudaVencimientoTexto}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {deudaVencimientoNombre || "Al día con tus pagos"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
