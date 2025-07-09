import { addMonths, addWeeks, addDays } from 'date-fns';
import type { Loan, PaymentSchedule, LoanSummary, ExtraPayment, RateChange } from '../types';

// Calculate monthly payment using the standard amortization formula
export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) {
    return principal / termMonths;
  }
  
  const monthlyRate = annualRate / 12 / 100;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  // Round to 2 decimal places to avoid floating point errors
  return Math.round(payment * 100) / 100;
}

// Calculate payment frequency multiplier
export function getPaymentFrequencyMultiplier(frequency: 'monthly' | 'bi-weekly' | 'weekly'): number {
  switch (frequency) {
    case 'monthly':
      return 1;
    case 'bi-weekly':
      return 26 / 12; // 26 payments per year / 12 months
    case 'weekly':
      return 52 / 12; // 52 payments per year / 12 months
    default:
      return 1;
  }
}

// Generate complete amortization schedule
export function generateAmortizationSchedule(loan: Loan): PaymentSchedule[] {
  const { principal, annualRate, termYears, termMonths, startDate, paymentFrequency, extraPayments, rateChanges } = loan;
  
  const totalMonths = termYears * 12 + termMonths;
  const frequencyMultiplier = getPaymentFrequencyMultiplier(paymentFrequency);
  const baseMonthlyPayment = calculateMonthlyPayment(principal, annualRate, totalMonths);
  const adjustedPayment = baseMonthlyPayment * frequencyMultiplier;
  
  const schedule: PaymentSchedule[] = [];
  let remainingBalance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let currentDate = new Date(startDate);
  let currentRate = annualRate;
  let currentEMI = adjustedPayment;

  // Sort modifications by month
  const sortedExtraPayments = [...extraPayments].sort((a, b) => a.month - b.month);
  const sortedRateChanges = [...rateChanges].sort((a, b) => a.month - b.month);
  let nextRateChangeIdx = 0;

  for (let month = 1; month <= totalMonths; month++) {
    // Check for rate/EMI changes
    while (nextRateChangeIdx < sortedRateChanges.length && sortedRateChanges[nextRateChangeIdx].month === month) {
      const rateChange = sortedRateChanges[nextRateChangeIdx];
      if (typeof rateChange.newRate === 'number' && rateChange.newRate > 0) {
        currentRate = rateChange.newRate;
      }
      if (typeof rateChange.newEMI === 'number' && rateChange.newEMI > 0) {
        currentEMI = rateChange.newEMI;
      } else {
        // If no newEMI, recalculate EMI based on current rate and remaining term
        const monthsLeft = totalMonths - month + 1;
        currentEMI = calculateMonthlyPayment(remainingBalance, currentRate, monthsLeft) * frequencyMultiplier;
      }
      nextRateChangeIdx++;
    }

    const monthlyRate = currentRate / 12 / 100;
    const interestAmount = remainingBalance * monthlyRate;
    let principalAmount = currentEMI - interestAmount;

    // Check for extra payments
    const extraPayment = sortedExtraPayments.find(ep => ep.month === month);
    if (extraPayment) {
      principalAmount += extraPayment.amount;
    }

    // Ensure we don't overpay
    if (principalAmount > remainingBalance) {
      principalAmount = remainingBalance;
    }

    const paymentAmount = principalAmount + interestAmount;
    remainingBalance -= principalAmount;

    // Ensure remaining balance doesn't go negative
    if (remainingBalance < 0) {
      remainingBalance = 0;
    }

    cumulativeInterest += interestAmount;
    cumulativePrincipal += principalAmount;

    schedule.push({
      paymentNumber: month,
      date: new Date(currentDate),
      paymentAmount: Math.round(paymentAmount * 100) / 100,
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
      cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
    });

    // Update date for next payment
    switch (paymentFrequency) {
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'bi-weekly':
        currentDate = addWeeks(currentDate, 2);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
    }

    // If loan is paid off, break early
    if (remainingBalance <= 0) {
      break;
    }
  }

  return schedule;
}

// Calculate loan summary from schedule
export function calculateLoanSummary(schedule: PaymentSchedule[], loan: Loan): LoanSummary {
  const totalPayments = schedule.length;
  const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
  const totalPrincipal = loan.principal;
  const monthlyPayment = schedule[0]?.paymentAmount || 0;
  const payoffDate = schedule[schedule.length - 1]?.date || new Date();
  const totalCost = totalPrincipal + totalInterest;
  
  return {
    totalPayments,
    totalInterest,
    totalPrincipal,
    monthlyPayment,
    payoffDate,
    totalCost,
  };
}

// Calculate remaining balance at a specific month
export function calculateRemainingBalance(schedule: PaymentSchedule[], month: number): number {
  const payment = schedule.find(p => p.paymentNumber === month);
  return payment ? payment.remainingBalance : 0;
}

// Apply extra payment and recalculate from that point
export function applyExtraPayment(schedule: PaymentSchedule[], month: number, amount: number): PaymentSchedule[] {
  const newSchedule = [...schedule];
  const paymentIndex = newSchedule.findIndex(p => p.paymentNumber === month);
  
  if (paymentIndex === -1) return schedule;
  
  // Apply extra payment to principal
  newSchedule[paymentIndex].principalAmount += amount;
  newSchedule[paymentIndex].paymentAmount += amount;
  newSchedule[paymentIndex].remainingBalance -= amount;
  
  // Recalculate remaining payments
  let remainingBalance = newSchedule[paymentIndex].remainingBalance;
  let cumulativeInterest = newSchedule[paymentIndex].cumulativeInterest;
  let cumulativePrincipal = newSchedule[paymentIndex].cumulativePrincipal;
  
  for (let i = paymentIndex + 1; i < newSchedule.length; i++) {
    const payment = newSchedule[i];
    const monthlyRate = 0.05 / 12; // Assuming 5% rate, should be passed as parameter
    const interestAmount = remainingBalance * monthlyRate;
    const principalAmount = payment.paymentAmount - interestAmount;
    
    remainingBalance -= principalAmount;
    cumulativeInterest += interestAmount;
    cumulativePrincipal += principalAmount;
    
    newSchedule[i] = {
      ...payment,
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
      cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
    };
    
    if (remainingBalance <= 0) {
      return newSchedule.slice(0, i + 1);
    }
  }
  
  return newSchedule;
}

// Calculate savings from modifications
export function calculateSavings(originalSchedule: PaymentSchedule[], modifiedSchedule: PaymentSchedule[]): {
  interestSaved: number;
  timeSaved: number;
  paymentReduced: number;
} {
  const originalTotalInterest = originalSchedule[originalSchedule.length - 1]?.cumulativeInterest || 0;
  const modifiedTotalInterest = modifiedSchedule[modifiedSchedule.length - 1]?.cumulativeInterest || 0;
  const interestSaved = originalTotalInterest - modifiedTotalInterest;
  
  const timeSaved = originalSchedule.length - modifiedSchedule.length;
  
  const originalMonthlyPayment = originalSchedule[0]?.paymentAmount || 0;
  const modifiedMonthlyPayment = modifiedSchedule[0]?.paymentAmount || 0;
  const paymentReduced = originalMonthlyPayment - modifiedMonthlyPayment;
  
  return {
    interestSaved: Math.round(interestSaved * 100) / 100,
    timeSaved,
    paymentReduced: Math.round(paymentReduced * 100) / 100,
  };
}

// Validate loan parameters
export function validateLoan(loan: Partial<Loan>): string[] {
  const errors: string[] = [];
  
  if (!loan.principal || loan.principal <= 0) {
    errors.push('Principal amount must be greater than 0');
  }
  
  if (!loan.annualRate || loan.annualRate < 0) {
    errors.push('Annual rate must be 0 or greater');
  }
  
  if (!loan.termYears && !loan.termMonths) {
    errors.push('Loan term must be specified');
  }
  
  if (loan.termYears && loan.termYears < 0) {
    errors.push('Years must be 0 or greater');
  }
  
  if (loan.termMonths && loan.termMonths < 0) {
    errors.push('Months must be 0 or greater');
  }
  
  if ((!loan.termYears || loan.termYears === 0) && (!loan.termMonths || loan.termMonths === 0)) {
    errors.push('Loan term must be greater than 0');
  }
  
  return errors;
} 

export type ExtraPaymentSimple = { month: number; amount: number };
export type EMIChange = { month: number; newEMI: number };
export type EMIRecord = {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  remainingPrincipal: number;
};

export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  startingEMI: number,
  tenureMonths: number,
  extraPayments: ExtraPaymentSimple[] = [],
  emiChanges: EMIChange[] = []
): EMIRecord[] {
  const monthlyRate = annualRate / 12 / 100;
  let remainingPrincipal = principal;
  let emi = startingEMI;
  let month = 1;
  const schedule: EMIRecord[] = [];
  let emiChangeIdx = 0;
  let extraPaymentIdx = 0;

  // Sort interventions
  const sortedEmiChanges = [...emiChanges].sort((a, b) => a.month - b.month);
  const sortedExtraPayments = [...extraPayments].sort((a, b) => a.month - b.month);

  while (remainingPrincipal > 0 && month <= tenureMonths) {
    // Apply EMI change if any
    if (emiChangeIdx < sortedEmiChanges.length && sortedEmiChanges[emiChangeIdx].month === month) {
      emi = sortedEmiChanges[emiChangeIdx].newEMI;
      emiChangeIdx++;
    }

    // Calculate interest for this month
    const interestPaid = remainingPrincipal * monthlyRate;
    let principalPaid = emi - interestPaid;

    // Edge case: EMI too low to cover interest
    if (principalPaid < 0) {
      principalPaid = 0;
    }

    // Apply extra payment if any
    let extraPayment = 0;
    if (extraPaymentIdx < sortedExtraPayments.length && sortedExtraPayments[extraPaymentIdx].month === month) {
      extraPayment = sortedExtraPayments[extraPaymentIdx].amount;
      extraPaymentIdx++;
    }

    // Total principal paid this month
    let totalPrincipalPaid = principalPaid + extraPayment;

    // Prevent overpayment
    if (totalPrincipalPaid > remainingPrincipal) {
      totalPrincipalPaid = remainingPrincipal;
    }

    // Update remaining principal
    remainingPrincipal = Math.max(remainingPrincipal - totalPrincipalPaid, 0);

    schedule.push({
      month,
      emi,
      principalPaid: Math.round(principalPaid * 100) / 100,
      interestPaid: Math.round(interestPaid * 100) / 100,
      remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
    });

    // If loan is paid off, break
    if (remainingPrincipal <= 0) break;

    month++;
  }

  return schedule;
} 