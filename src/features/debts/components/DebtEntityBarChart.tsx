"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtSnapshotItem } from "../utils/debtTimelineCalculations";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Users } from "lucide-react";

interface DebtEntityBarChartProps {
  items: DebtSnapshotItem[];
  cutoffDateStr: string;
}

export function DebtEntityBarChart({ items, cutoffDateStr }: DebtEntityBarChartProps) {
  const entityData = items
    .filter((d) => d.pendingAtCutoff > 0)
    .map((d) => ({
      name: d.description,
      value: d.pendingAtCutoff,
      color: d.type === "payable" ? "#ef4444" : "#10b981",
      type: d.type === "payable" ? "Por Pagar" : "Por Cobrar",
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="h-[400px] flex flex-col bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Balance Pendiente por Entidad
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Saldos activos a la fecha de corte ({cutoffDateStr})
        </p>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        {entityData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={entityData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  `$${
                    val >= 1000
                      ? (val / 1000).toLocaleString("es-AR", {
                          maximumFractionDigits: 1,
                        }) + "k"
                      : val.toLocaleString("es-AR")
                  }`
                }
              />
              <Tooltip
                formatter={(value: any, _: any, item: any) => [
                  `$${formatCurrency(value)}`,
                  item.payload.type,
                ]}
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#a1a1aa", fontWeight: "bold" }}
                cursor={{ fill: "rgba(128,128,128,0.1)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={55}>
                {entityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No hay saldos pendientes a esta fecha de corte.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
