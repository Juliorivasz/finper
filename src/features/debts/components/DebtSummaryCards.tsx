import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { formatCurrency } from "@/lib/utils"

interface DebtSummaryCardsProps {
  porPagar: number
  porCobrar: number
}

export function DebtSummaryCards({ porPagar, porCobrar }: DebtSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard
        variant="danger"
        title="Yo debo (Por Pagar)"
        amount={`$${formatCurrency(porPagar)}`}
        icon={<ArrowUpRight className="h-6 w-6 text-red-500" />}
      />
      <StatCard
        variant="success"
        title="Me deben (Por Cobrar)"
        amount={`$${formatCurrency(porCobrar)}`}
        icon={<ArrowDownRight className="h-6 w-6 text-green-500" />}
      />
    </div>
  )
}
