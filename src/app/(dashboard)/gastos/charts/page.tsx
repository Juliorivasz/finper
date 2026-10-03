"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdvancedExpenseCharts } from "@/features/expenses/components/AdvancedExpenseCharts";

export default function ExpensesChartsPage() {
  const router = useRouter();
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/gastos")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Análisis de Gastos</h1>
          <p className="text-muted-foreground mt-1">Explora tus datos financieros en detalle.</p>
        </div>
      </div>

      <AdvancedExpenseCharts />
    </div>
  );
}
