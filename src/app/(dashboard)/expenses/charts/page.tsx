"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExpensesChartsPage() {
  const router = useRouter();
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/expenses")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Análisis de Gastos</h1>
          <p className="text-muted-foreground mt-1">Explora tus datos financieros en detalle.</p>
        </div>
      </div>

      <Card className="p-12 border-dashed flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl mb-2">Próximamente: Gráficos Avanzados</CardTitle>
        <p className="text-muted-foreground max-w-md">
          Aquí podrás visualizar tus gastos por meses, años y semanas, comparar categorías y tener un control total con gráficos dinámicos. Estamos preparando esta sección.
        </p>
      </Card>
    </div>
  );
}
