import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { PaymentSchedule } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useLoanStore } from '../../store/loanStore';

interface PaymentBreakdownChartProps {
  schedule: PaymentSchedule[];
}

const PaymentBreakdownChart: React.FC<PaymentBreakdownChartProps> = ({ schedule }) => {
  if (schedule.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Calculate total principal and interest
  const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principalAmount, 0);
  const totalInterest = schedule.reduce((sum, payment) => sum + payment.interestAmount, 0);
  const totalPayment = totalPrincipal + totalInterest;

  const data = [
    {
      name: 'Principal',
      value: totalPrincipal,
      color: '#3b82f6',
      percentage: (totalPrincipal / totalPayment) * 100,
    },
    {
      name: 'Interest',
      value: totalInterest,
      color: '#ef4444',
      percentage: (totalInterest / totalPayment) * 100,
    },
  ];

  const selectedCurrency = useLoanStore((state) => state.selectedCurrency);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm" style={{ color: data.color }}>
            Amount: {formatCurrency(data.value, selectedCurrency)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: {formatPercentage(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center space-x-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {entry.value}: {formatCurrency(data[index].value, selectedCurrency)} ({formatPercentage(data[index].percentage)})
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full h-96 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={110}
            outerRadius={140}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {/* Tooltip removed */}
        </PieChart>
      </ResponsiveContainer>
      {/* Centered stacked summary */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-3 select-none pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data[0].color }} />
          <span className="text-sm text-blue-400 font-medium">Principal</span>
        </div>
        <div className="text-xl font-bold text-blue-300">
          {formatCurrency(totalPrincipal, selectedCurrency)}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data[1].color }} />
          <span className="text-sm text-red-400 font-medium">Interest</span>
        </div>
        <div className="text-xl font-bold text-red-300">
          {formatCurrency(totalInterest, selectedCurrency)}
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdownChart; 