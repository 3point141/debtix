import React from 'react';
import { motion } from 'framer-motion';
import { useLoanStore } from '../store/loanStore';
import { formatCurrency } from '../utils/formatters';

const Demo: React.FC = () => {
  const { currentSummary, currentSchedule, isValid } = useLoanStore();

  if (!isValid) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Live Demo
      </h3>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Monthly Payment:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(currentSummary.monthlyPayment)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Interest:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(currentSummary.totalInterest)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Payments:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentSummary.totalPayments}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Cost:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(currentSummary.totalCost)}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Try changing the loan parameters in the sidebar to see real-time updates!
        </p>
      </div>
    </motion.div>
  );
};

export default Demo; 