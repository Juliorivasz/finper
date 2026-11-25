"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Plus, Wallet, ArrowDownToLine, CreditCard, ChevronRight, ChevronLeft } from "lucide-react";
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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AddTab>("expense");
  const [isManuallyDocked, setIsManuallyDocked] = useState(false);
  const [isScrollDocked, setIsScrollDocked] = useState(false);
  const lastScrollY = useRef(0);

  // Sincronizar la pestaña por defecto según la sección actual
  useEffect(() => {
    if (pathname?.startsWith("/deudas")) {
      setActiveTab("debt");
    } else if (pathname?.startsWith("/ingresos")) {
      setActiveTab("income");
    } else if (pathname?.startsWith("/gastos")) {
      setActiveTab("expense");
    }
  }, [pathname]);

  // Auto-minimizar a pestaña lateral al scrollear hacia abajo o llegar al final (paginación)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const nearBottom =
        window.innerHeight + currentY >= document.documentElement.scrollHeight - 100;

      if ((currentY > lastScrollY.current && currentY > 50) || nearBottom) {
        setIsScrollDocked(true);
      } else if (currentY < lastScrollY.current - 15 && !nearBottom) {
        setIsScrollDocked(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDocked = isManuallyDocked || isScrollDocked;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-20 md:bottom-6 z-40 flex items-center transition-all duration-300 ease-out",
          isDocked ? "right-0" : "right-3 md:right-6"
        )}
      >
        {isDocked ? (
          /* Estado minimizado: Pestaña lateral compacta pegada al borde que no tapa tablas ni paginación */
          <div className="flex items-center bg-primary/90 hover:bg-primary text-primary-foreground shadow-md rounded-l-full border border-r-0 border-border/40 opacity-70 hover:opacity-100 transition-all duration-200">
            <button
              type="button"
              onClick={() => {
                setIsManuallyDocked(false);
                setIsScrollDocked(false);
              }}
              className="pl-2 pr-1 py-2.5 flex items-center justify-center cursor-pointer hover:opacity-80"
              aria-label="Expandir botón de nuevo registro"
              title="Expandir botón"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="pr-2.5 pl-1 py-2.5 flex items-center justify-center cursor-pointer"
              aria-label="Agregar nuevo registro"
              title="Nuevo registro"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Estado expandido: Píldora flotante compacta con botón para acoplar al borde */
          <div className="group flex items-center bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 border border-border/20 transition-all duration-200">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 pl-3.5 pr-2.5 h-11 text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-95 active:scale-95 transition-transform"
              aria-label="Agregar nuevo registro"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
            <div className="h-5 w-[1px] bg-primary-foreground/20" />
            <button
              type="button"
              onClick={() => setIsManuallyDocked(true)}
              className="px-2 h-11 flex items-center justify-center text-primary-foreground/75 hover:text-primary-foreground cursor-pointer transition-colors"
              aria-label="Minimizar botón al borde lateral"
              title="Ocultar en el borde lateral"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md p-4 sm:p-5 gap-3 rounded-xl overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-semibold">Nuevo Registro</DialogTitle>
          </DialogHeader>

          {/* Segmented Control / Tabs */}
          <div className="flex bg-muted/60 p-1 rounded-lg gap-1 border border-border">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isSelected = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer",
                    isSelected
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div>
            {activeTab === "expense" && <ExpenseForm onSuccessCallback={() => setIsOpen(false)} />}
            {activeTab === "income" && <IncomeForm onSuccessCallback={() => setIsOpen(false)} />}
            {activeTab === "debt" && <DebtForm onSuccessCallback={() => setIsOpen(false)} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
