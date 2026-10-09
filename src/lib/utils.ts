import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const absoluteAmount = Math.abs(amount || 0);
  return absoluteAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseLocalDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function calculateOverdueInterest(
  originalAmount: number,
  dueDate: string | null | undefined,
  tna: number | null | undefined
): { interestAmount: number; daysOverdue: number; totalAmount: number } {
  if (!dueDate || !tna || tna <= 0) {
    return { interestAmount: 0, daysOverdue: 0, totalAmount: originalAmount };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const due = parseLocalDate(dueDate);
  due.setHours(0, 0, 0, 0);

  // No interest if not overdue
  if (today <= due) {
    return { interestAmount: 0, daysOverdue: 0, totalAmount: originalAmount };
  }

  // Calculate difference in days
  const diffTime = today.getTime() - due.getTime();
  const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // TNA logic: (TNA / 365) = daily rate percentage
  // Example: TNA 36.5% -> Daily Rate 0.1% -> 0.001
  const dailyRate = (tna / 100) / 365;
  const interestAmount = originalAmount * dailyRate * daysOverdue;
  
  return {
    interestAmount,
    daysOverdue,
    totalAmount: originalAmount + interestAmount,
  };
}
