import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DollarSign, Percent, Calendar, Clock } from 'lucide-react';
import { useLoanStore } from '../../store/loanStore';
import { formatDateForInput } from '../../utils/formatters';

interface LoanFormData {
  principal: string;
  annualRate: string;
  termYears: string;
  termMonths: string;
  startDate: string;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
}

const DEFAULT_VALUES: LoanFormData = {
  principal: '300000',
  annualRate: '4.5',
  termYears: '30',
  termMonths: '0',
  startDate: formatDateForInput(new Date()),
  paymentFrequency: 'monthly',
};

const Sidebar: React.FC = () => {
  const { currentLoan, updateLoan, selectedCurrency, updateCurrency } = useLoanStore();

  // Only set defaultValues ONCE, not from Zustand store
  const { register, handleSubmit, setValue, reset } = useForm<LoanFormData>({
    defaultValues: DEFAULT_VALUES,
  });

  // Sync form with store after submit or store changes
  useEffect(() => {
    reset({
      principal: currentLoan.principal.toString(),
      annualRate: currentLoan.annualRate.toString(),
      termYears: currentLoan.termYears.toString(),
      termMonths: currentLoan.termMonths.toString(),
      startDate: formatDateForInput(currentLoan.startDate),
      paymentFrequency: currentLoan.paymentFrequency,
    });
  }, [currentLoan, reset]);

  // Remove useEffect that syncs on every change

  // Submit handler
  const onSubmit = (values: LoanFormData) => {
    updateLoan({
      principal: parseFloat(values.principal) || 0,
      annualRate: parseFloat(values.annualRate) || 0,
      termYears: parseInt(values.termYears) || 0,
      termMonths: parseInt(values.termMonths) || 0,
      startDate: new Date(values.startDate),
      paymentFrequency: values.paymentFrequency,
    });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen"
    >
      <div className="p-6">
        {/* Currency Selector */}
        <div className="mb-6">
          <label className="label block mb-2 text-gray-900 dark:text-white font-medium">Currency</label>
          <select
            value={selectedCurrency}
            onChange={e => updateCurrency(e.target.value)}
            className="input-field"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CNY">CNY - Chinese Yuan</option>
            <option value="SGD">SGD - Singapore Dollar</option>
          </select>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Loan Parameters
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Principal Amount */}
          <div>
            <label className="label flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Principal Amount</span>
            </label>
            <input
              type="text"
              {...register('principal')}
              className="input-field"
              placeholder="300,000"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="label flex items-center space-x-2">
              <Percent className="w-4 h-4" />
              <span>Annual Interest Rate (%)</span>
            </label>
            <input
              type="text"
              {...register('annualRate')}
              className="input-field"
              placeholder="4.5"
            />
          </div>

          {/* Loan Term */}
          <div>
            <label className="label flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Loan Term</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  {...register('termYears')}
                  className="input-field"
                  placeholder="30"
                  min="0"
                />
                <span className="text-xs text-gray-500 mt-1 block">Years</span>
              </div>
              <div>
                <input
                  type="number"
                  {...register('termMonths')}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  max="11"
                />
                <span className="text-xs text-gray-500 mt-1 block">Months</span>
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="label flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Start Date</span>
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="input-field"
            />
          </div>

          {/* Payment Frequency */}
          <div>
            <label className="label">Payment Frequency</label>
            <select
              {...register('paymentFrequency')}
              className="input-field"
            >
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setValue('principal', '300000');
                setValue('annualRate', '4.5');
                setValue('termYears', '30');
                setValue('termMonths', '0');
                setValue('startDate', formatDateForInput(new Date()));
                setValue('paymentFrequency', 'monthly');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Reset to Default
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('principal', '500000');
                setValue('annualRate', '3.5');
                setValue('termYears', '15');
                setValue('termMonths', '0');
                setValue('startDate', formatDateForInput(new Date()));
                setValue('paymentFrequency', 'monthly');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Load 15-Year Example
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar; 