import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateLoanSummary,
  validateLoan,
} from '../calculations';
import type { Loan } from '../../types';

describe('Loan Calculations', () => {
  const sampleLoan: Loan = {
    id: 'test-1',
    principal: 300000,
    annualRate: 4.5,
    termYears: 30,
    termMonths: 0,
    startDate: new Date('2024-01-01'),
    paymentFrequency: 'monthly',
    extraPayments: [],
    rateChanges: [],
  };

  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment for 30-year fixed', () => {
      const payment = calculateMonthlyPayment(300000, 4.5, 360);
      expect(payment).toBeCloseTo(1520.06, 2);
    });

    it('should handle zero interest rate', () => {
      const payment = calculateMonthlyPayment(300000, 0, 360);
      expect(payment).toBeCloseTo(833.33, 2);
    });

    it('should calculate correct payment for 15-year loan', () => {
      const payment = calculateMonthlyPayment(300000, 4.5, 180);
      expect(payment).toBeCloseTo(2294.98, 2);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate correct number of payments', () => {
      const schedule = generateAmortizationSchedule(sampleLoan);
      expect(schedule).toHaveLength(360);
    });

    it('should have correct first payment breakdown', () => {
      const schedule = generateAmortizationSchedule(sampleLoan);
      const firstPayment = schedule[0];
      
      expect(firstPayment.paymentNumber).toBe(1);
      expect(firstPayment.paymentAmount).toBeCloseTo(1520.06, 2);
      expect(firstPayment.interestAmount).toBeCloseTo(1125.00, 2);
      expect(firstPayment.principalAmount).toBeCloseTo(395.06, 2);
    });

    it('should have correct last payment', () => {
      const schedule = generateAmortizationSchedule(sampleLoan);
      const lastPayment = schedule[schedule.length - 1];
      
      expect(lastPayment.remainingBalance).toBeCloseTo(0, 2);
    });

    it('should handle extra payments', () => {
      const loanWithExtra = {
        ...sampleLoan,
        extraPayments: [{ id: 'extra-1', month: 12, amount: 10000, description: 'Bonus' }],
      };
      
      const schedule = generateAmortizationSchedule(loanWithExtra);
      const extraPayment = schedule.find(p => p.paymentNumber === 12);
      
      expect(extraPayment?.principalAmount).toBeGreaterThan(395.06);
    });
  });

  describe('calculateLoanSummary', () => {
    it('should calculate correct summary', () => {
      const schedule = generateAmortizationSchedule(sampleLoan);
      const summary = calculateLoanSummary(schedule, sampleLoan);
      
      expect(summary.totalPayments).toBe(360);
      expect(summary.totalPrincipal).toBe(300000);
      expect(summary.monthlyPayment).toBeCloseTo(1520.06, 2);
      expect(summary.totalCost).toBeCloseTo(547221.60, 2);
    });
  });

  describe('validateLoan', () => {
    it('should validate correct loan parameters', () => {
      const errors = validateLoan(sampleLoan);
      expect(errors).toHaveLength(0);
    });

    it('should catch invalid principal', () => {
      const errors = validateLoan({ ...sampleLoan, principal: 0 });
      expect(errors).toContain('Principal amount must be greater than 0');
    });

    it('should catch negative interest rate', () => {
      const errors = validateLoan({ ...sampleLoan, annualRate: -1 });
      expect(errors).toContain('Annual rate must be 0 or greater');
    });

    it('should catch missing loan term', () => {
      const errors = validateLoan({ ...sampleLoan, termYears: 0, termMonths: 0 });
      expect(errors).toContain('Loan term must be greater than 0');
    });
  });
}); 