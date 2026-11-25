"use client";

import Link from "next/link";
import { Search, PieChart as PieChartIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface DebtFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  modalityFilter: string;
  onModalityFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
}

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "payable", label: "Yo debo" },
  { value: "receivable", label: "Me deben" },
];

const MODALITY_FILTER_OPTIONS = [
  { value: "all", label: "Todas las modalidades" },
  { value: "credit_card", label: "Tarjetas" },
  { value: "personal_loan", label: "Préstamos" },
  { value: "bank_loan", label: "Bancarios" },
  { value: "simple", label: "Personas" },
];

const SORT_BY_OPTIONS = [
  { value: "due_date_asc", label: "Vencimiento (Próximo)" },
  { value: "amount_desc", label: "Monto (Mayor)" },
  { value: "amount_asc", label: "Monto (Menor)" },
  { value: "created_desc", label: "Recientes" },
];

export function DebtFilterBar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  modalityFilter,
  onModalityFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  resultsCount,
}: DebtFilterBarProps) {
  const hasActiveFilters =
    searchTerm !== "" || typeFilter !== "all" || modalityFilter !== "all" || sortBy !== "due_date_asc";

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row gap-2.5 justify-between items-center w-full">
        {/* Search */}
        <div className="relative w-full md:max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción, banco..."
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters and Link */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-center justify-end gap-2">
          <Link href="/deudas/charts" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2 cursor-pointer">
              <PieChartIcon className="h-4 w-4" />
              Gráficos
            </Button>
          </Link>

          <Select
            className="w-full sm:w-[120px]"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            options={TYPE_FILTER_OPTIONS}
          />

          <Select
            className="w-full sm:w-[165px]"
            value={modalityFilter}
            onChange={(e) => onModalityFilterChange(e.target.value)}
            options={MODALITY_FILTER_OPTIONS}
          />

          <Select
            className="w-full sm:w-[185px]"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            options={SORT_BY_OPTIONS}
          />
        </div>
      </div>

      {/* Counters & Reset */}
      <div className="flex justify-between items-center w-full min-h-[32px] pt-1">
        <div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {resultsCount} resultado(s)
        </span>
      </div>
    </div>
  );
}
