"use client";

import { useState } from "react";
import { Plus, Wallet, ArrowDownToLine, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { IncomeForm } from "@/features/incomes/components/IncomeForm";
import { DebtForm } from "@/features/debts/components/DebtForm";
import { cn } from "@/lib/utils";

type AddTab = "expense" | "income" | "debt";

const TABS: { id: AddTab; label: string; icon: typeof Wallet }[] = [
  { id: "expense", label: "Gastos", icon: Wallet },
  { id: "income", label: "Ingresos", icon: ArrowDownToLine },
  { id: "debt", label: "Deudas", icon: CreditCard },
];

export function GlobalAddButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AddTab>("expense");

  return (
    <>
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 group flex items-center justify-end">
        {/* Tooltip interactivo en hover */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-foreground text-background text-sm font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-md">
          Nuevo registro
        </div>

        {/* Botón Principal FAB */}
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          onClick={() => setIsOpen(true)}
          aria-label="Agregar nuevo registro"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Nuevo Registro</DialogTitle>
          </DialogHeader>

          {/* Segmented Control / Tabs */}
          <div className="flex bg-muted/60 p-1 rounded-xl gap-1 mb-4 border border-border">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isSelected = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer",
                    isSelected
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2">
            {activeTab === "expense" && <ExpenseForm onSuccessCallback={() => setIsOpen(false)} />}
            {activeTab === "income" && <IncomeForm onSuccessCallback={() => setIsOpen(false)} />}
            {activeTab === "debt" && <DebtForm onSuccessCallback={() => setIsOpen(false)} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
