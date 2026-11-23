"use client";

import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, RotateCcw } from "lucide-react";

interface DebtChartsFilterBarProps {
  typeFilter: "all" | "payable" | "receivable";
  onTypeFilterChange: (val: "all" | "payable" | "receivable") => void;
  statusFilter: "all" | "pending" | "paid";
  onStatusFilterChange: (val: "all" | "pending" | "paid") => void;
  rangeFilter: "30d" | "90d" | "this_year" | "all";
  onRangeFilterChange: (val: "30d" | "90d" | "this_year" | "all") => void;
  cutoffDateStr: string;
  onCutoffDateChange: (val: string) => void;
  onResetToToday: () => void;
  isTodayCutoff: boolean;
}

const TYPE_OPTIONS = [
  { value: "all", label: "Todas (Pagar y Cobrar)" },
  { value: "payable", label: "Solo mis deudas (Por Pagar)" },
  { value: "receivable", label: "Deudas de otros (Por Cobrar)" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Solo Pendientes (Activas)" },
  { value: "paid", label: "Solo Saldadas (Pagadas)" },
];

const RANGE_OPTIONS = [
  { value: "all", label: "Todo el Histórico" },
  { value: "this_year", label: "Este Año" },
  { value: "90d", label: "Últimos 90 Días" },
  { value: "30d", label: "Últimos 30 Días" },
];

export function DebtChartsFilterBar({
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  rangeFilter,
  onRangeFilterChange,
  cutoffDateStr,
  onCutoffDateChange,
  onResetToToday,
  isTodayCutoff,
}: DebtChartsFilterBarProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* 1. Tipo de Deuda */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tipo de Deuda</Label>
          <Select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as any)}
            options={TYPE_OPTIONS}
          />
        </div>

        {/* 2. Estado de la Deuda */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            options={STATUS_OPTIONS}
          />
        </div>

        {/* 3. Rango de Evolución */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Rango de Evolución</Label>
          <Select
            value={rangeFilter}
            onChange={(e) => onRangeFilterChange(e.target.value as any)}
            options={RANGE_OPTIONS}
          />
        </div>

        {/* 4. Fecha de Corte Acumulada */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              Foto Acumulada al
            </Label>
            {!isTodayCutoff && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetToToday}
                className="h-5 px-1.5 text-[11px] text-primary hover:text-primary/80 gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Hoy
              </Button>
            )}
          </div>
          <Input
            type="date"
            value={cutoffDateStr}
            onChange={(e) => onCutoffDateChange(e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </Card>
  );
}
