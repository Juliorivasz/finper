import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface OverdueAlertBannerProps {
  deudasVencidas: any[]
}

export function OverdueAlertBanner({ deudasVencidas }: OverdueAlertBannerProps) {
  const router = useRouter()

  if (deudasVencidas.length === 0) return null

  return (
    <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-red-500 text-sm md:text-base">
            ¡Tienes {deudasVencidas.length} deuda{deudasVencidas.length > 1 ? "s" : ""}{" "}
            vencida{deudasVencidas.length > 1 ? "s" : ""}!
          </h3>
          <p className="text-xs md:text-sm text-red-500/80 mt-1">
            {deudasVencidas.map((d: any) => d.description).join(", ")}
          </p>
        </div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="w-full sm:w-auto whitespace-nowrap cursor-pointer"
        onClick={() => router.push("/deudas")}
      >
        Ir a pagarlas
      </Button>
    </div>
  )
}
