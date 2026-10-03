"use client";

import { useState } from "react";
import { Plus, Wallet, ArrowDownToLine, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { IncomeForm } from "@/features/incomes/components/IncomeForm";
import { DebtForm } from "@/features/debts/components/DebtForm";

export function GlobalAddButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"expense" | "income" | "debt">("expense");

  return (
    <>
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Registro</DialogTitle>
          </DialogHeader>
          
          <div className="flex bg-muted/50 p-1 rounded-lg gap-1 mb-4">
            <button
              onClick={() => setActiveTab("expense")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "expense" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Wallet className="h-4 w-4" /> Gastos
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "income" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ArrowDownToLine className="h-4 w-4" /> Ingresos
            </button>
            <button
              onClick={() => setActiveTab("debt")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "debt" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CreditCard className="h-4 w-4" /> Deudas
            </button>
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
