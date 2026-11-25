"use client";

import { History, HandCoins, Trash2, PlusCircle, CreditCard, Banknote, Building2, User } from "lucide-react";
import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { Debt } from "../types";
import { getCardDisplayTitle, calculateInstallmentMetrics } from "../utils/debtCalculations";

export type ProcessedDebt = Debt & {
  debt_payments: any[];
  paid: number;
  pending: number;
  originalPending: number;
  interestAmount: number;
  daysLate: number;
};

interface DebtTableProps {
  debts: ProcessedDebt[];
  today: Date;
  onViewHistory: (debt: ProcessedDebt) => void;
  onPayDebt: (debt: ProcessedDebt) => void;
  onAddCharge: (debt: ProcessedDebt) => void;
  onDeleteDebt: (id: string) => void;
}

export function DebtTable({
  debts,
  today,
  onViewHistory,
  onPayDebt,
  onAddCharge,
  onDeleteDebt,
}: DebtTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Compromiso / Tarjeta</TableHead>
            <TableHead className="px-6 py-4">Modalidad</TableHead>
            <TableHead className="px-6 py-4">Estado & Cuotas</TableHead>
            <TableHead className="px-6 py-4 text-right">Original</TableHead>
            <TableHead className="px-6 py-4 text-right text-primary">Saldo Pendiente</TableHead>
            <TableHead className="px-6 py-4 text-center w-40">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.map((debt) => {
            const isOverdue =
              debt.pending > 0 && debt.due_date && parseLocalDate(debt.due_date) < today;

            const displayTitle = getCardDisplayTitle(debt);
            const installmentInfo = debt.installments_total && debt.installments_total > 1
              ? calculateInstallmentMetrics(debt.amount, debt.installments_total, debt.installments_paid || 0)
              : null;

            return (
              <TableRow key={debt.id} className="group">
                {/* 1. Descripción & Vencimiento */}
                <TableCell className="px-6 py-4 font-medium max-w-[240px] truncate">
                  <span className="text-foreground font-semibold block truncate">
                    {displayTitle}
                  </span>
                  <div className="text-xs mt-1 truncate flex items-center gap-1.5">
                    <span className="text-muted-foreground">
                      {debt.type === "payable" ? "Yo debo" : "Me deben"} •
                    </span>
                    <span className={isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"}>
                      {isOverdue
                        ? `Venció hace ${formatDistanceStrict(parseLocalDate(debt.due_date!), today, { locale: es })}`
                        : `Vence: ${debt.due_date ? parseLocalDate(debt.due_date).toLocaleDateString(undefined) : "S/F"}`}
                    </span>
                  </div>
                </TableCell>

                {/* 2. Badge de Modalidad */}
                <TableCell className="px-6 py-4">
                  {debt.modality === "credit_card" && (
                    <Badge variant="outline" className="gap-1 text-xs border-primary/40 text-primary">
                      <CreditCard className="w-3 h-3" /> Tarjeta
                    </Badge>
                  )}
                  {debt.modality === "personal_loan" && (
                    <Badge variant="outline" className="gap-1 text-xs border-emerald-500/40 text-emerald-500">
                      <Banknote className="w-3 h-3" /> Préstamo
                    </Badge>
                  )}
                  {debt.modality === "bank_loan" && (
                    <Badge variant="outline" className="gap-1 text-xs border-blue-500/40 text-blue-500">
                      <Building2 className="w-3 h-3" /> Bancario
                    </Badge>
                  )}
                  {(!debt.modality || debt.modality === "simple") && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <User className="w-3 h-3" /> Persona
                    </Badge>
                  )}
                </TableCell>

                {/* 3. Estado & Avance de Cuotas */}
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-start">
                    {debt.pending <= 0 ? (
                      <Badge variant="success">Saldada</Badge>
                    ) : (
                      <Badge variant="warning">Pendiente</Badge>
                    )}
                    {installmentInfo && (
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Cuota {installmentInfo.currentInstallment}/{debt.installments_total}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 4. Monto Original */}
                <TableCell className="px-6 py-4 text-muted-foreground text-right">
                  ${formatCurrency(debt.amount)}
                </TableCell>

                {/* 5. Saldo Pendiente */}
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end justify-center space-y-0.5">
                    <span className="font-bold text-primary text-sm">
                      ${formatCurrency(Math.max(0, debt.pending))}
                    </span>
                    {debt.interestAmount > 0 && (
                      <span className="text-[11px] text-red-500 font-medium">
                        +${formatCurrency(debt.interestAmount)} mora
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 6. Acciones */}
                <TableCell className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                      onClick={() => onAddCharge(debt)}
                      title={debt.modality === "credit_card" ? "Sumar compra a la tarjeta" : "Sumar deuda / Ampliar"}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer"
                      onClick={() => onViewHistory(debt)}
                      title="Ver historial de movimientos"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    {debt.pending > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                        onClick={() => onPayDebt(debt)}
                        title="Abonar a cuenta"
                      >
                        <HandCoins className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                      onClick={() => onDeleteDebt(debt.id)}
                      title="Eliminar registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
