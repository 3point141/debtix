import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PaymentSchedule } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useLoanStore } from '../../store/loanStore';

interface AmortizationChartProps {
  schedule: PaymentSchedule[];
}

const AmortizationChart: React.FC<AmortizationChartProps> = ({ schedule }) => {
  // Use full schedule for month-wise granularity
  const chartData = schedule.map((payment) => ({
    month: payment.paymentNumber,
    principal: payment.principalAmount,
    interest: payment.interestAmount,
    remainingBalance: payment.remainingBalance,
    cumulativeInterest: payment.cumulativeInterest,
  }));

  const selectedCurrency = useLoanStore((state) => state.selectedCurrency);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            Month {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value, selectedCurrency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => `Month ${value}`}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value, selectedCurrency)}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="principal"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.8}
            name="Principal"
          />
          <Area
            type="monotone"
            dataKey="interest"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.8}
            name="Interest"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AmortizationChart; 