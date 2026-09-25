import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Tomar valor absoluto para que no tenga símbolos de menos "-" (se confía en el color)
  const absoluteAmount = Math.abs(amount || 0);
  // 'es-AR' o 'es-ES' usan punto para miles y coma para decimales (ej: 1.234,56)
  return absoluteAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseLocalDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  // Extraer solo la parte "YYYY-MM-DD"
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  // Construir la fecha usando los componentes locales del navegador
  return new Date(Number(year), Number(month) - 1, Number(day));
}
