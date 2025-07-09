export interface Loan {
  id: string;
  principal: number;
  annualRate: number;
  termYears: number;
  termMonths: number;
  startDate: Date;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  extraPayments: ExtraPayment[];
  rateChanges: RateChange[];
}

export interface PaymentSchedule {
  paymentNumber: number;
  date: Date;
  paymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface ExtraPayment {
  id: string;
  month: number;
  amount: number;
  description?: string;
}

export interface RateChange {
  id: string;
  month: number;
  newRate: number;
  newEMI?: number; // Optional: new EMI amount starting from this month
  emiIncreaseBy?: number; // Optional: EMI increase by this amount
  description?: string;
}

export interface LoanSummary {
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
  monthlyPayment: number;
  payoffDate: Date;
  totalCost: number;
}

export interface Scenario {
  id: string;
  name: string;
  loan: Loan;
  schedule: PaymentSchedule[];
  summary: LoanSummary;
  isModified: boolean;
}

export interface ComparisonResult {
  originalScenario: Scenario;
  modifiedScenario: Scenario;
  interestSaved: number;
  timeSaved: number;
  paymentReduced: number;
}

export type PaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly';

export interface ChartDataPoint {
  month: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  cumulativeInterest: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
} 