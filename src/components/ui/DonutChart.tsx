"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from "recharts";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

const VIBRANT_COLORS = [
  "#3b82f6", // Azul
  "#10b981", // Esmeralda
  "#f59e0b", // Ámbar
  "#ef4444", // Rojo
  "#8b5cf6", // Violeta
  "#ec4899", // Rosa
  "#06b6d4", // Cyan
  "#84cc16", // Lima
];

interface DonutChartProps {
  data: { name: string; value: number }[];
  totalValue: number;
  centerText?: string;
  emptyMessage?: string;
}

export function DonutChart({ data, totalValue, centerText = "Total", emptyMessage = "Sin datos" }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full min-h-[250px]">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Formatting compact if > 999,999 to avoid overflow in the donut hole
  
  const getFormattedTotal = (val: number) => {
    const formatted = formatCurrency(val);
    if (formatted.length > 11) {
      return formatted.substring(0, 11) + "...";
    }
    return formatted;
  };

  if (!mounted) return <div className="h-full w-full min-h-[250px]" />;

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
      <PieChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
          ))}
          <Label
            content={({ viewBox }) => {
              const { cx, cy } = viewBox as any;
              return (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                  <tspan x={cx} y={cy - 10} fontSize="12" fill="#888888">{centerText}</tspan>
                  <tspan x={cx} y={cy + 12} fontSize="18" fontWeight="bold" fill="currentColor">
                    ${getFormattedTotal(totalValue)}
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <Tooltip
          formatter={(value) => `$${formatCurrency(Number(value ?? 0))}`}
          contentStyle={{ 
            borderRadius: "8px", 
            border: "1px solid #333", 
            backgroundColor: "#171717",
            color: "#fff"
          }}
          itemStyle={{ color: "#fff" }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={30}
          wrapperStyle={{ fontSize: "12px", color: "inherit", paddingTop: "0px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
