"use client";

import { useState, useMemo } from "react";
import { useGetDebts } from "../hooks/useDebts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, Label } from "recharts";
import { formatCurrency, parseLocalDate } from "@/lib/utils";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export function AdvancedDebtCharts() {
  const { data: debts, isLoading } = useGetDebts();
  
  const [typeFilter, setTypeFilter] = useState("all");

  const processedDebts = useMemo(() => {
    if (!debts) return [];
    return debts.map(d => {
      const paid = d.debt_payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const pending = d.amount - paid;
      return { ...d, paid, pending };
    });
  }, [debts]);

  const filteredDebts = useMemo(() => {
    if (typeFilter === "all") return processedDebts;
    return processedDebts.filter(d => d.type === typeFilter);
  }, [processedDebts, typeFilter]);

  // Totales
  const { totalPagar, totalCobrar, totalPaid, totalPending } = useMemo(() => {
    let pagar = 0;
    let cobrar = 0;
    let paid = 0;
    let pendingSum = 0;
    
    filteredDebts.forEach(d => {
      const pending = Math.max(0, d.pending);
      if (d.type === "payable") pagar += pending;
      else if (d.type === "receivable") cobrar += pending;
      
      paid += d.paid;
      pendingSum += pending;
    });
    
    return { totalPagar: pagar, totalCobrar: cobrar, totalPaid: paid, totalPending: pendingSum };
  }, [filteredDebts]);

  // 1. Datos para el gráfico de barras por entidad
  const entityData = useMemo(() => {
    return filteredDebts
      .filter(d => d.pending > 0) // Solo deudas activas
      .map(d => ({
        name: d.description,
        value: d.pending,
        color: d.type === "payable" ? "#ef4444" : "#10b981"
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredDebts]);

  // 2. Progreso de Liquidación (Pagado vs Pendiente)
  const progressData = useMemo(() => {
    return [
      { name: "Saldado (Pagado)", value: totalPaid, fill: "#10b981" },
      { name: "Por Pagar (Pendiente)", value: totalPending, fill: "#ef4444" }
    ].filter(d => d.value > 0);
  }, [totalPaid, totalPending]);

  // 3. Próximos Vencimientos
  const dueDatesData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    filteredDebts.forEach(d => {
      if (d.pending > 0 && d.due_date) {
        const date = parseLocalDate(d.due_date);
        // Evitamos fechas inválidas
        if (!isNaN(date.getTime())) {
          // Formato: "Oct 2026"
          const key = date.toLocaleDateString("es-AR", { month: 'short', year: 'numeric' });
          grouped[key] = (grouped[key] || 0) + d.pending;
        }
      }
    });

    // Convertir a array. Ordenarlo asumiendo que el texto no es ordenable fácilmente, 
    // pero idealmente se ordena por fecha real. Para simplificar, extraemos el Date para sortear.
    return Object.entries(grouped)
      .map(([key, amount]) => {
        // Truco para sortear: parseamos un mes/año
        const [monthStr, yearStr] = key.split(" ");
        const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
        const monthIndex = months.findIndex(m => monthStr.toLowerCase().startsWith(m));
        const sortValue = parseInt(yearStr) * 12 + (monthIndex !== -1 ? monthIndex : 0);
        
        return { name: key, value: amount, sortValue };
      })
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(({ name, value }) => ({ name, value, color: "#f59e0b" }));
  }, [filteredDebts]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando gráficos...</div>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-64">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de Deuda</label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todas (Por Pagar y Cobrar)</option>
              <option value="payable">Solo mis deudas (Por Pagar)</option>
              <option value="receivable">Deudas de otros (Por Cobrar)</option>
            </select>
          </div>
          
          <div className="ml-auto flex flex-col sm:flex-row gap-6 items-end">
            {(typeFilter === "all" || typeFilter === "payable") && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-red-500 block">Total a Pagar</span>
                <span className="text-xl font-bold text-foreground">
                  ${formatCurrency(totalPagar)}
                </span>
              </div>
            )}
            {(typeFilter === "all" || typeFilter === "receivable") && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-emerald-500 block">Total a Cobrar</span>
                <span className="text-xl font-bold text-foreground">
                  ${formatCurrency(totalCobrar)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Gráfico de Entidades */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Balance Activo por Entidad</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0">
            {entityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })+'k' : val.toLocaleString("es-AR")}`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${formatCurrency(value)}`, "Pendiente"]}
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #333", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#a1a1aa" }}
                    cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {entityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No hay deudas activas</div>
            )}
          </CardContent>
        </Card>

        {/* 2. Gráfico de Progreso */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Progreso de Liquidación</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy - 10} fill="#a1a1aa" fontSize={14}>Total</tspan>
                              <tspan x={viewBox.cx} y={viewBox.cy + 15} fill="#fff" fontSize={18} fontWeight="bold">
                                ${formatCurrency(totalPaid + totalPending)}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `$${formatCurrency(value)}`}
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #333", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Próximos Vencimientos */}
      <Card className="h-[350px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Próximos Vencimientos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          {dueDatesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dueDatesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })+'k' : val.toLocaleString("es-AR")}`} />
                <Tooltip 
                  formatter={(value: any) => [`$${formatCurrency(value)}`, "Vence"]}
                  contentStyle={{ backgroundColor: "#171717", border: "1px solid #333", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#a1a1aa" }}
                  cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                  {dueDatesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">No hay vencimientos registrados</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
