"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { Debt } from "@/features/debts/hooks/useDebts";

export function DebtChart({ debts }: { debts: Debt[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!debts || debts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground text-sm">No tienes deudas registradas</p>
      </div>
    );
  }

  let porPagar = 0;
  let porCobrar = 0;

  debts.forEach(d => {
    const pagado = d.debt_payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const pendiente = d.amount - pagado;
    
    if (pendiente > 0) {
      if (d.type === "payable") porPagar += pendiente;
      else porCobrar += pendiente;
    }
  });

  const data = [
    { name: "Por Pagar", value: porPagar, color: "#ef4444" }, // Rojo
    { name: "Por Cobrar", value: porCobrar, color: "#10b981" } // Verde
  ];

  if (!mounted) return <div className="h-[300px] w-full" />;

  // Función para acortar o formatear números muy largos (ej. $1,000,000)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="currentColor" 
          tick={{ fill: "currentColor" }} 
          axisLine={false} 
          tickLine={false}
          dy={10}
        />
        <YAxis 
          width={80}
          stroke="currentColor" 
          tick={{ fill: "currentColor", fontSize: 12 }} 
          axisLine={false} 
          tickLine={false}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          formatter={(value) => [`$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Balance"]}
          cursor={{ fill: 'rgba(128,128,128,0.1)' }}
          contentStyle={{ 
            borderRadius: "8px", 
            border: "1px solid #333", 
            backgroundColor: "#171717",
            color: "#fff"
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
