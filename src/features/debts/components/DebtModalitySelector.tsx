"use client";

import { CreditCard, Banknote, Building2, User } from "lucide-react";
import { DebtModality } from "../types";
import { cn } from "@/lib/utils";

interface DebtModalitySelectorProps {
  selectedModality: DebtModality;
  onSelect: (modality: DebtModality) => void;
}

const MODALITIES: { id: DebtModality; label: string; icon: typeof CreditCard }[] = [
  { id: "credit_card", label: "Tarjeta", icon: CreditCard },
  { id: "personal_loan", label: "Préstamo", icon: Banknote },
  { id: "bank_loan", label: "Bancario", icon: Building2 },
  { id: "simple", label: "Persona", icon: User },
];

export function DebtModalitySelector({ selectedModality, onSelect }: DebtModalitySelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1 p-1 bg-muted/40 rounded-lg border border-border">
      {MODALITIES.map((m) => {
        const Icon = m.icon;
        const active = selectedModality === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors cursor-pointer select-none",
              active
                ? "bg-background text-foreground shadow-xs font-semibold border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
