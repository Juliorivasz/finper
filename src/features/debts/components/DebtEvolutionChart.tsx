"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimeSeriesPoint } from "../utils/debtTimelineCalculations";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, MousePointerClick } from "lucide-react";

interface DebtEvolutionChartProps {
  data: TimeSeriesPoint[];
  cutoffDateStr: string;
  onSelectCutoffDate: (dateKey: string) => void;
}

export function DebtEvolutionChart({
  data,
  cutoffDateStr,
  onSelectCutoffDate,
}: DebtEvolutionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-[420px] flex flex-col items-center justify-center p-6 bg-card border-border">
        <p className="text-muted-foreground text-sm">
          No hay movimientos históricos en este rango seleccionado.
        </p>
      </Card>
    );
  }

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const clickedItem = state.activePayload[0].payload as TimeSeriesPoint;
      if (clickedItem && clickedItem.dateKey) {
        onSelectCutoffDate(clickedItem.dateKey);
      }
    }
  };

  return (
    <Card className="h-[420px] flex flex-col bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Evolución del Saldo y Amortización
          </CardTitle>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-primary" />
            Haz clic en un punto de la gráfica para fijar la foto acumulada a esa fecha
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Fecha activa: {cutoffDateStr}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            onClick={handleChartClick}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />

            <XAxis
              dataKey="formattedDate"
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
                    ? (val / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 }) + "k"
                    : val.toLocaleString("es-AR")
                }`
              }
            />

            <Tooltip
              formatter={(value: any, name: any) => {
                const label = name === "totalPending" ? "Saldo Pendiente" : "Total Pagado";
                return [`$${formatCurrency(value)}`, label];
              }}
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#a1a1aa", fontWeight: "bold" }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground font-medium">
                  {value === "totalPending" ? "Saldo Pendiente" : "Total Amortizado (Pagado)"}
                </span>
              )}
            />

            <Area
              type="monotone"
              dataKey="totalPending"
              stroke="#ef4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPending)"
              activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="totalPaid"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPaid)"
              activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
