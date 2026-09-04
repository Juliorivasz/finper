"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { Expense } from "@/features/expenses/types";


// Colores más vibrantes y modernos para diferenciar mejor las categorías
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

export function CategoryChart({ expenses }: { expenses: Expense[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground text-sm">Sin datos para graficar este mes</p>
      </div>
    );
  }

  // Agrupar gastos por categoría
  const grouped = expenses.reduce((acc, expense) => {
    const name = (expense as any).categories?.name || "Categoría general";
    acc[name] = (acc[name] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  // Si no está montado, mostramos un placeholder para evitar hidratación fallida
  if (!mounted) return <div className="h-[300px] w-full" />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}
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
          height={36} 
          wrapperStyle={{ fontSize: "12px", color: "inherit" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
