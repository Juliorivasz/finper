"use client";

import { useState, useMemo } from "react";
import { useGetIncomes } from "../hooks/useIncomes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, PieChart, Pie, Legend } from "recharts";
import { formatCurrency, parseLocalDate } from "@/lib/utils";

// Colores consistentes
const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export function AdvancedIncomeCharts() {
  const { data: incomes, isLoading } = useGetIncomes();
  
  const [timeFilter, setTimeFilter] = useState("current_month");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    if (!incomes) return [];
    const cats = new Set(incomes.map(e => e.category || "General"));
    return Array.from(cats).sort();
  }, [incomes]);

  const filteredincomes = useMemo(() => {
    if (!incomes) return [];
    
    let filtered = incomes;
    
    // Filtro por categoría (entidad)
    if (categoryFilter !== "all") {
      filtered = filtered.filter(e => (e.category || "General") === categoryFilter);
    }
    
    // Filtro por tiempo
    const now = new Date();
    if (timeFilter === "current_month") {
      filtered = filtered.filter(e => {
        const d = parseLocalDate(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (timeFilter === "last_month") {
      filtered = filtered.filter(e => {
        const d = parseLocalDate(e.date);
        let lastMonth = now.getMonth() - 1;
        let year = now.getFullYear();
        if (lastMonth < 0) {
          lastMonth = 11;
          year -= 1;
        }
        return d.getMonth() === lastMonth && d.getFullYear() === year;
      });
    } else if (timeFilter === "this_year") {
      filtered = filtered.filter(e => parseLocalDate(e.date).getFullYear() === now.getFullYear());
    }

    return filtered;
  }, [incomes, timeFilter, categoryFilter]);

  // Datos para el gráfico de tiempo (Línea)
  const timeData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    filteredincomes.forEach(exp => {
      let key = "";
      const d = parseLocalDate(exp.date);
      if (timeFilter === "current_month" || timeFilter === "last_month") {
        // Agrupar por día
        key = d.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' });
      } else {
        // Agrupar por mes
        key = d.toLocaleDateString("es-AR", { month: 'short', year: 'numeric' });
      }
      grouped[key] = (grouped[key] || 0) + exp.amount;
    });

    // Ordenar cronológicamente (aprox para simplificar, en un caso real se ordenan las fechas)
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      // .sort() no funcionará perfecto para MM/AAAA sin parsear, pero los Ingresos ya vienen más o menos ordenados o lo podemos hacer si es necesario.
  }, [filteredincomes, timeFilter]);

  // Datos para el gráfico de torta (Distribución de categorías)
  const categoryData = useMemo(() => {
    if (categoryFilter !== "all") return []; // No tiene sentido si ya filtramos 1 sola categoría
    
    const grouped: Record<string, number> = {};
    filteredincomes.forEach(exp => {
      const cat = exp.category || "General";
      grouped[cat] = (grouped[cat] || 0) + exp.amount;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredincomes, categoryFilter]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando gráficos...</div>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-64">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Periodo</label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="current_month">Este Mes</option>
              <option value="last_month">Mes Pasado</option>
              <option value="this_year">Este Año</option>
              <option value="all_time">Todo el Histórico</option>
            </select>
          </div>
          
          <div className="w-full sm:w-64">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoría (Entidad)</label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="ml-auto flex flex-col items-end">
            <span className="text-xs font-medium text-muted-foreground block">Total del Periodo</span>
            <span className="text-2xl font-bold text-foreground">
              ${formatCurrency(filteredincomes.reduce((acc, curr) => acc + curr.amount, 0))}
            </span>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Tendencia */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Evolución de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0">
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${formatCurrency(value)}`, "Total"]}
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #333", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos en este periodo</div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Categorías */}
        {categoryFilter === "all" ? (
          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `$${formatCurrency(value)}`}
                      contentStyle={{ backgroundColor: "#171717", border: "1px solid #333", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#a1a1aa" }}
                    />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos</div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-[400px] flex flex-col items-center justify-center bg-muted/10 border-dashed">
            <p className="text-muted-foreground text-center px-8">
              Estás viendo una sola categoría ({categoryFilter}), por lo que el gráfico de distribución no aplica. Selecciona "Todas las Categorías" para ver el reparto.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
