"use client";

import { useState, useMemo } from "react";
import { useGetExpenses } from "../hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { DonutChart } from "@/components/ui/DonutChart";

export function AdvancedExpenseCharts() {
  const { data: expenses, isLoading } = useGetExpenses();
  
  const [timeFilter, setTimeFilter] = useState("current_month");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  });
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    if (!expenses) return [];
    const cats = new Set(expenses.map(e => (e as any).categories?.name || "General"));
    return Array.from(cats).sort();
  }, [expenses]);

  const handleTimeFilterChange = (val: string) => {
    setTimeFilter(val);
    const now = new Date();
    if (val === "current_month") {
      setDateRange({
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      });
    } else if (val === "last_month") {
      setDateRange({
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      });
    } else if (val === "last_30_days") {
      const from = new Date();
      from.setDate(now.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      setDateRange({ from, to });
    } else if (val === "this_year") {
      setDateRange({
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      });
    } else if (val === "all_time") {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const handleCustomRangeSelect = (range: any) => {
    setDateRange({ from: range?.from, to: range?.to });
    setTimeFilter("custom");
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter(exp => {
      // Filtro por categoría
      if (categoryFilter !== "all") {
        const cat = (exp as any).categories?.name || "General";
        if (cat !== categoryFilter) return false;
      }
      
      // Filtro por rango de fechas
      if (dateRange.from || dateRange.to) {
        const d = parseLocalDate(exp.date);
        d.setHours(0, 0, 0, 0);
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (d < fromDate) return false;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (d > toDate) return false;
        }
      }
      
      return true;
    });
  }, [expenses, dateRange, categoryFilter]);

  // Datos para el gráfico de tiempo (Línea) ordenados cronológicamente
  const timeData = useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    const timestamps = filteredExpenses.map(e => parseLocalDate(e.date).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const diffDays = (maxTime - minTime) / (1000 * 60 * 60 * 24);
    const isDaily = diffDays <= 45;

    const sorted = [...filteredExpenses].sort(
      (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
    );

    const grouped: Record<string, number> = {};
    sorted.forEach(exp => {
      const d = parseLocalDate(exp.date);
      const key = isDaily
        ? d.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' })
        : d.toLocaleDateString("es-AR", { month: 'short', year: 'numeric' });
      grouped[key] = (grouped[key] || 0) + exp.amount;
    });

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }));
  }, [filteredExpenses]);

  // Datos para el gráfico de torta (Distribución de categorías)
  const categoryData = useMemo(() => {
    if (categoryFilter !== "all") return [];
    
    const grouped: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const cat = (exp as any).categories?.name || "General";
      grouped[cat] = (grouped[cat] || 0) + exp.amount;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categoryFilter]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando gráficos...</div>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto flex-wrap">
            {/* Selector de Periodo */}
            <div className="w-full sm:w-44 space-y-1">
              <Label className="text-xs text-muted-foreground">Periodo</Label>
              <Select 
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value)}
                options={[
                  { value: "current_month", label: "Este Mes" },
                  { value: "last_month", label: "Mes Pasado" },
                  { value: "last_30_days", label: "Últimos 30 días" },
                  { value: "this_year", label: "Este Año" },
                  { value: "all_time", label: "Todo el Histórico" },
                  { value: "custom", label: "Personalizado" },
                ]}
              />
            </div>

            {/* Selector de Rango de Fechas */}
            <div className="w-full sm:w-[240px] space-y-1">
              <Label className="text-xs text-muted-foreground">Rango de fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background cursor-pointer h-10 px-3"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs sm:text-sm">
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yy", { locale: es })} -{" "}
                            {format(dateRange.to, "dd/MM/yy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: es })
                        )
                      ) : (
                        <span className="text-muted-foreground">Sin restricción</span>
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 max-w-[calc(100vw-20px)] z-50" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={handleCustomRangeSelect}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Categoría */}
            <div className="w-full sm:w-48 space-y-1">
              <Label className="text-xs text-muted-foreground">Categoría</Label>
              <Select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: "all", label: "Todas las Categorías" },
                  ...categories.map(c => ({ value: c as string, label: c as string })),
                ]}
              />
            </div>

            {/* Restablecer si hay filtro no predeterminado */}
            {(categoryFilter !== "all" || timeFilter !== "current_month") && (
              <div className="self-end pb-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter("all");
                    handleTimeFilterChange("current_month");
                  }}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Restablecer
                </Button>
              </div>
            )}
          </div>
          
          {/* Métrica Total */}
          <div className="flex flex-col sm:items-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
            <span className="text-xs font-medium text-muted-foreground block">Total del Periodo</span>
            <span className="text-2xl font-bold text-red-500">
              ${formatCurrency(filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0))}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {filteredExpenses.length} registro(s)
            </span>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Tendencia */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Evolución de Gastos</CardTitle>
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
                <DonutChart data={categoryData} totalValue={categoryData.reduce((acc, curr) => acc + curr.value, 0)} centerText="Total" />
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

