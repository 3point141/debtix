import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, TrendingUp, Clock } from 'lucide-react';
import type { LoanSummary } from '../../types';
import { formatCurrency, formatDate, formatDuration } from '../../utils/formatters';
import { useLoanStore } from '../../store/loanStore';

interface SummaryCardsProps {
  summary: LoanSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const selectedCurrency = useLoanStore((state) => state.selectedCurrency);
  const cards = [
    {
      title: 'Monthly Payment',
      value: formatCurrency(summary.monthlyPayment, selectedCurrency),
      icon: DollarSign,
      color: 'bg-blue-500',
      description: 'Regular payment amount',
    },
    {
      title: 'Total Interest',
      value: formatCurrency(summary.totalInterest, selectedCurrency),
      icon: TrendingUp,
      color: 'bg-red-500',
      description: 'Interest paid over life of loan',
    },
    {
      title: 'Payoff Date',
      value: formatDate(summary.payoffDate),
      icon: Calendar,
      color: 'bg-green-500',
      description: 'Date loan will be fully paid',
    },
    {
      title: 'Loan Term',
      value: formatDuration(summary.totalPayments),
      icon: Clock,
      color: 'bg-purple-500',
      description: 'Total time to pay off loan',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {card.title}
            </h3>
            
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SummaryCards; 