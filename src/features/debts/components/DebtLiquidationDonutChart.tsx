"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface DebtLiquidationDonutChartProps {
  totalPaid: number;
  totalPending: number;
  totalOriginal: number;
  paidPercentage: number;
  pendingPercentage: number;
  cutoffDateStr: string;
}

export function DebtLiquidationDonutChart({
  totalPaid,
  totalPending,
  totalOriginal,
  paidPercentage,
  pendingPercentage,
  cutoffDateStr,
}: DebtLiquidationDonutChartProps) {
  const data = [
    { name: "Amortizado (Pagado)", value: totalPaid, fill: "#10b981", percent: paidPercentage },
    { name: "Saldo Pendiente", value: totalPending, fill: "#ef4444", percent: pendingPercentage },
  ].filter((d) => d.value > 0);

  return (
    <Card className="h-[400px] flex flex-col bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-primary" />
          Proporción de Liquidación
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Porcentaje acumulado liquidado vs por pagar al {cutoffDateStr}
        </p>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="46%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, _: any, item: any) => [
                  `$${formatCurrency(value)} (${item.payload.percent}%)`,
                  item.name,
                ]}
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground font-medium">
                    {value}: <strong className="text-foreground">{entry.payload?.percent}%</strong>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No hay compromisos registrados hasta esta fecha.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
