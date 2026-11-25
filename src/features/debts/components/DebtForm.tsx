"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtSchema, DebtFormValues } from "../schemas/debtSchema";
import { useCreateDebt, useGetSavedCards } from "../hooks/useDebts";
import { DebtModalitySelector } from "./DebtModalitySelector";
import { DebtModality } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { CARD_BRANDS, POPULAR_BANKS, INSTALLMENT_PRESETS } from "../constants/banksAndBrands";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DebtFormProps {
  onSuccessCallback?: () => void;
}

export function DebtForm({ onSuccessCallback }: DebtFormProps) {
  const { mutate: createDebt, isPending } = useCreateDebt();
  const savedCards = useGetSavedCards();

  const [selectedModality, setSelectedModality] = useState<DebtModality>("simple");
  const [selectedCardKey, setSelectedCardKey] = useState<string>("new");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      modality: "simple",
      type: "payable",
      amount: "" as unknown as number,
      description: "",
      due_date: "",
      interest_rate: "" as unknown as number,
      installments_total: 1,
      allows_capital_amortization: false,
    },
  });

  const handleModalityChange = (mod: DebtModality) => {
    setSelectedModality(mod);
    setValue("modality", mod);
    if (mod === "personal_loan") {
      setValue("allows_capital_amortization", true);
    }
  };

  const handleCardSelect = (key: string) => {
    setSelectedCardKey(key);
    if (key !== "new") {
      const card = savedCards.find((c) => `${c.bank}-${c.brand}-${c.lastDigits}` === key);
      if (card) {
        setValue("card_bank", card.bank);
        setValue("card_brand", card.brand);
        setValue("card_last_digits", card.lastDigits);
        setValue("card_alias", card.alias);
        setValue("description", card.alias);
      }
    }
  };

  const onSubmit = (data: DebtFormValues) => {
    createDebt(
      {
        ...data,
        amount: Number(data.amount),
        due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
        interest_rate: data.interest_rate ? Number(data.interest_rate) : null,
        installments_total: Number(data.installments_total) || 1,
      },
      {
        onSuccess: () => {
          toast.success("Compromiso registrado con éxito");
          reset();
          onSuccessCallback?.();
        },
        onError: (error) => {
          toast.error(`Error al registrar: ${error.message}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
      {/* 1. Selector de Modalidad (1 sola fila compacta) */}
      <DebtModalitySelector selectedModality={selectedModality} onSelect={handleModalityChange} />

      {/* 2. Monto Principal */}
      <FormField label="Monto" error={errors.amount?.message} required>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <AnimatedAmountInput value={field.value} onChange={field.onChange} autoFocus />
          )}
        />
      </FormField>

      {/* 3. Campos dinámicos compactos según Modalidad */}
      {selectedModality === "credit_card" && (
        <div className="space-y-2.5">
          {savedCards.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Tarjeta" className="col-span-2">
                <Select
                  value={selectedCardKey}
                  onChange={(e) => handleCardSelect(e.target.value)}
                  options={[
                    ...savedCards.map((c) => ({
                      value: `${c.bank}-${c.brand}-${c.lastDigits}`,
                      label: `[${c.brand}] ${c.bank} (•••• ${c.lastDigits})`,
                    })),
                    { value: "new", label: "+ Nueva tarjeta" },
                  ]}
                />
              </FormField>
              <FormField label="Cuotas">
                <Select
                  options={INSTALLMENT_PRESETS.map((p) => ({ value: String(p.value), label: p.label }))}
                  onChange={(e) => setValue("installments_total", Number(e.target.value))}
                />
              </FormField>
            </div>
          )}

          {selectedCardKey === "new" && (
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Banco" required>
                <Select options={POPULAR_BANKS} {...register("card_bank")} />
              </FormField>
              <FormField label="Marca" required>
                <Select options={CARD_BRANDS} {...register("card_brand")} />
              </FormField>
              <FormField label="4 dígitos">
                <Input maxLength={4} placeholder="Ej: 4321" {...register("card_last_digits")} />
              </FormField>
            </div>
          )}

          {savedCards.length > 0 ? (
            <FormField label="Concepto / Compra" error={errors.description?.message} required>
              <Input placeholder="Ej: Pasajes, Supermercado..." {...register("description")} />
            </FormField>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Concepto / Compra" error={errors.description?.message} required className="col-span-2">
                <Input placeholder="Ej: Pasajes, Supermercado..." {...register("description")} />
              </FormField>
              <FormField label="Cuotas">
                <Select
                  options={INSTALLMENT_PRESETS.map((p) => ({ value: String(p.value), label: p.label }))}
                  onChange={(e) => setValue("installments_total", Number(e.target.value))}
                />
              </FormField>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <FormField label="Día Cierre">
              <Input type="number" min={1} max={31} placeholder="1-31" {...register("statement_closing_date", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Vencimiento">
              <Input type="date" {...register("due_date")} />
            </FormField>
            <FormField label="TNA %">
              <Input type="number" step="0.01" placeholder="Ej: 45" {...register("interest_rate", { valueAsNumber: true })} />
            </FormField>
          </div>
        </div>
      )}

      {selectedModality === "personal_loan" && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            <FormField label="Prestamista / Fintech" error={errors.description?.message} required className="col-span-2">
              <Input placeholder="Ej: Mercado Pago, Ualá..." {...register("description")} />
            </FormField>
            <FormField label="Cuotas" required>
              <Input type="number" min={1} defaultValue={1} {...register("installments_total", { valueAsNumber: true })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Vencimiento" hint="Opcional">
              <Input type="date" {...register("due_date")} />
            </FormField>
            <FormField label="TNA % Anual" hint="Opcional">
              <Input type="number" step="0.01" placeholder="Ej: 45.0" {...register("interest_rate", { valueAsNumber: true })} />
            </FormField>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <Checkbox id="amort" defaultChecked {...register("allows_capital_amortization")} />
            <Label htmlFor="amort" className="text-xs cursor-pointer font-normal text-muted-foreground select-none">
              Permite amortizar a capital (descuenta intereses al adelantar)
            </Label>
          </div>
        </div>
      )}

      {selectedModality === "bank_loan" && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            <FormField label="Banco" error={errors.description?.message} required className="col-span-2">
              <Select options={POPULAR_BANKS} {...register("description")} />
            </FormField>
            <FormField label="Cuotas" required>
              <Input type="number" min={1} defaultValue={12} {...register("installments_total", { valueAsNumber: true })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Vencimiento" hint="Opcional">
              <Input type="date" {...register("due_date")} />
            </FormField>
            <FormField label="TNA % Anual" hint="Opcional">
              <Input type="number" step="0.01" placeholder="Ej: 45.0" {...register("interest_rate", { valueAsNumber: true })} />
            </FormField>
          </div>
        </div>
      )}

      {selectedModality === "simple" && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            <FormField label="Persona / Concepto" error={errors.description?.message} required className="col-span-2">
              <Input placeholder="Ej: Préstamo a Lucas..." {...register("description")} />
            </FormField>
            <FormField label="Tipo">
              <Select
                options={[{ value: "payable", label: "Yo debo" }, { value: "receivable", label: "Me deben" }]}
                {...register("type")}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Vencimiento" hint="Opcional">
              <Input type="date" {...register("due_date")} />
            </FormField>
            <FormField label="TNA % Anual" hint="Opcional">
              <Input type="number" step="0.01" placeholder="Ej: 45.0" {...register("interest_rate", { valueAsNumber: true })} />
            </FormField>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full mt-1 cursor-pointer" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Compromiso"}
      </Button>
    </form>
  );
}
