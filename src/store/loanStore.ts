import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Loan, Scenario, PaymentSchedule, LoanSummary } from '../types';
import { generateAmortizationSchedule, calculateLoanSummary, validateLoan } from '../utils/calculations';
import { generateId } from '../utils/formatters';

interface LoanState {
  // Current loan data
  currentLoan: Loan;
  
  // Scenarios
  scenarios: Scenario[];
  activeScenarioId: string | null;
  
  // UI state
  isLoading: boolean;
  errors: string[];

  // Currency
  selectedCurrency: string;
  updateCurrency: (currency: string) => void;
  
  // Actions
  updateLoan: (updates: Partial<Loan>) => void;
  addExtraPayment: (month: number, amount: number, description?: string) => void;
  removeExtraPayment: (paymentId: string) => void;
  addRateChange: (month: number, newRate: number, description?: string, newEMI?: number) => void;
  removeRateChange: (changeId: string) => void;
  createScenario: (name: string) => void;
  switchScenario: (scenarioId: string) => void;
  deleteScenario: (scenarioId: string) => void;
  resetLoan: () => void;
  clearErrors: () => void;
  
  // Computed values
  currentSchedule: PaymentSchedule[];
  currentSummary: LoanSummary;
  isValid: boolean;
}

const defaultLoan: Loan = {
  id: generateId(),
  principal: 300000,
  annualRate: 4.5,
  termYears: 30,
  termMonths: 0,
  startDate: new Date(),
  paymentFrequency: 'monthly',
  extraPayments: [],
  rateChanges: [],
};

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLoan: defaultLoan,
      scenarios: [],
      activeScenarioId: null,
      isLoading: false,
      errors: [],
      selectedCurrency: 'INR',
      updateCurrency: (currency) => set({ selectedCurrency: currency }),
      
      // Actions
      updateLoan: (updates) => {
        set((state) => {
          const updatedLoan = { ...state.currentLoan, ...updates };
          const errors = validateLoan(updatedLoan);
          
          return {
            currentLoan: updatedLoan,
            errors,
            isLoading: false,
          };
        });
      },
      
      addExtraPayment: (month, amount, description) => {
        set((state) => {
          const newExtraPayment = {
            id: generateId(),
            month,
            amount,
            description,
          };
          
          const updatedLoan = {
            ...state.currentLoan,
            extraPayments: [...state.currentLoan.extraPayments, newExtraPayment],
          };
          
          return {
            currentLoan: updatedLoan,
            errors: validateLoan(updatedLoan),
          };
        });
      },
      
      removeExtraPayment: (paymentId) => {
        set((state) => {
          const updatedLoan = {
            ...state.currentLoan,
            extraPayments: state.currentLoan.extraPayments.filter(
              (payment) => payment.id !== paymentId
            ),
          };
          
          return {
            currentLoan: updatedLoan,
            errors: validateLoan(updatedLoan),
          };
        });
      },
      
      addRateChange: (month, newRate, description, newEMI) => {
        set((state) => {
          const newRateChange = {
            id: generateId(),
            month,
            newRate,
            newEMI, // store newEMI if provided
            description,
          };
          const updatedLoan = {
            ...state.currentLoan,
            rateChanges: [...state.currentLoan.rateChanges, newRateChange],
          };
          return {
            currentLoan: updatedLoan,
            errors: validateLoan(updatedLoan),
          };
        });
      },
      
      removeRateChange: (changeId) => {
        set((state) => {
          const updatedLoan = {
            ...state.currentLoan,
            rateChanges: state.currentLoan.rateChanges.filter(
              (change) => change.id !== changeId
            ),
          };
          
          return {
            currentLoan: updatedLoan,
            errors: validateLoan(updatedLoan),
          };
        });
      },
      
      createScenario: (name) => {
        set((state) => {
          const newScenario: Scenario = {
            id: generateId(),
            name,
            loan: { ...state.currentLoan },
            schedule: state.currentSchedule,
            summary: state.currentSummary,
            isModified: false,
          };
          
          return {
            scenarios: [...state.scenarios, newScenario],
            activeScenarioId: newScenario.id,
          };
        });
      },
      
      switchScenario: (scenarioId) => {
        set((state) => {
          const scenario = state.scenarios.find((s) => s.id === scenarioId);
          if (!scenario) return state;
          
          return {
            currentLoan: { ...scenario.loan },
            activeScenarioId: scenarioId,
            errors: validateLoan(scenario.loan),
          };
        });
      },
      
      deleteScenario: (scenarioId) => {
        set((state) => {
          const updatedScenarios = state.scenarios.filter((s) => s.id !== scenarioId);
          const newActiveId = state.activeScenarioId === scenarioId 
            ? (updatedScenarios[0]?.id || null)
            : state.activeScenarioId;
          
          return {
            scenarios: updatedScenarios,
            activeScenarioId: newActiveId,
          };
        });
      },
      
      resetLoan: () => {
        set({
          currentLoan: defaultLoan,
          activeScenarioId: null,
          errors: [],
        });
      },
      
      clearErrors: () => {
        set({ errors: [] });
      },
      
      // Computed values
      get currentSchedule() {
        const { currentLoan } = get();
        try {
          return generateAmortizationSchedule(currentLoan);
        } catch (error) {
          console.error('Error generating schedule:', error);
          return [];
        }
      },
      
      get currentSummary() {
        const { currentLoan, currentSchedule } = get();
        try {
          return calculateLoanSummary(currentSchedule, currentLoan);
        } catch (error) {
          console.error('Error calculating summary:', error);
          return {
            totalPayments: 0,
            totalInterest: 0,
            totalPrincipal: 0,
            monthlyPayment: 0,
            payoffDate: new Date(),
            totalCost: 0,
          };
        }
      },
      
      get isValid() {
        const { errors } = get();
        return errors.length === 0;
      },
    }),
    {
      name: 'loan-visualizer-storage',
      partialize: (state) => ({
        currentLoan: state.currentLoan,
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
      }),
    }
  )
); 