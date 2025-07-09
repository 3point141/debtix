import React, { useState, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useLoanStore } from '../../store/loanStore';
import { formatCurrency } from '../../utils/formatters';
import { generateAmortizationSchedule, calculateSavings } from '../../utils/calculations';

const PlaygroundAmortizationChart: React.FC = () => {
  const currentLoan = useLoanStore((state) => state.currentLoan);
  const selectedCurrency = useLoanStore((state) => state.selectedCurrency);
  const schedule = useMemo(() => generateAmortizationSchedule(currentLoan), [currentLoan]);
  const chartData = schedule.map((payment) => ({
    month: payment.paymentNumber,
    principal: Math.max(payment.principalAmount, 0),
    interest: payment.interestAmount,
    remainingBalance: Math.max(payment.remainingBalance, 0),
    cumulativeInterest: payment.cumulativeInterest,
  }));

  // Compute original schedule (no extra payments or EMI changes)
  const originalLoan = useMemo(() => ({ ...currentLoan, extraPayments: [], rateChanges: [] }), [currentLoan]);
  const originalSchedule = useMemo(() => generateAmortizationSchedule(originalLoan), [originalLoan]);
  const savings = useMemo(() => calculateSavings(originalSchedule, schedule), [originalSchedule, schedule]);

  const [modalMonth, setModalMonth] = useState<number | null>(null);
  const [hovered, setHovered] = useState<{ month: number; x: number; y: number; principal: number; interest: number } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    x: number;
    y: number;
    principal: number;
    interest: number;
  } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [lumpSum, setLumpSum] = useState('');
  const [newEmi, setNewEmi] = useState('');

  const handlePlusClick = (month: number) => {
    setModalMonth(month);
    // Modal logic will be implemented in the next step
  };

  const handleModalClose = () => {
    setModalMonth(null);
    setLumpSum('');
    setNewEmi('');
  };

  const addExtraPayment = useLoanStore((state) => state.addExtraPayment);
  const addRateChange = useLoanStore((state) => state.addRateChange);

  // Find the EMI for the selected month (before any increase)
  const selectedMonthEmi = useMemo(() => {
    if (!selectedMonth) return null;
    // Find the EMI for the selected month in the current schedule
    const rec = chartData.find((d) => d.month === selectedMonth.month);
    return rec ? rec.principal + rec.interest : null;
  }, [selectedMonth, chartData]);

  const handleModalConfirm = () => {
    if (modalMonth !== null) {
      if (lumpSum && !isNaN(Number(lumpSum)) && Number(lumpSum) > 0) {
        addExtraPayment(modalMonth, Number(lumpSum));
      }
      if (newEmi && !isNaN(Number(newEmi)) && Number(newEmi) > 0 && selectedMonthEmi != null) {
        const increaseAmount = Number(newEmi);
        const newEmiValue = selectedMonthEmi + increaseAmount;
        addRateChange(modalMonth, 0, undefined, newEmiValue);
      }
    }
    handleModalClose();
  };

  // Custom tooltip without the plus button
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const principal = payload.find((p: any) => p.dataKey === 'principal')?.value;
      const interest = payload.find((p: any) => p.dataKey === 'interest')?.value;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px]">
          <div className="font-medium text-gray-900 dark:text-white mb-2">
            Month {label}
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-500">Principal:</span>
            <span>{formatCurrency(principal, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-500">Interest:</span>
            <span>{formatCurrency(interest, selectedCurrency)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Track hovered month and its X/Y position, and persist as selectedMonth
  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.chartX != null && state.chartY != null) {
      const principal = state.activePayload.find((p: any) => p.dataKey === 'principal')?.value ?? 0;
      const interest = state.activePayload.find((p: any) => p.dataKey === 'interest')?.value ?? 0;
      const hoverObj = {
        month: state.activePayload[0].payload.month,
        x: state.chartX,
        y: state.chartY,
        principal,
        interest,
      };
      setHovered(hoverObj);
      setSelectedMonth(hoverObj);
    } else {
      setHovered(null);
    }
  };
  const handleMouseLeave = () => {
    setHovered(null);
    // Do not clear selectedMonth, keep the last hovered month
  };

  // Find the selected month data for ReferenceLine and button
  const selected = selectedMonth;

  // Custom tooltip content for selected month
  const renderCustomTooltip = (selected: typeof selectedMonth) => {
    if (!selected) return null;
    return (
      <div
        className="absolute z-20 bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px]"
        style={{
          left: selected.x + 24, // offset to the right of the bar
          top: selected.y - 40, // offset above the bar
          pointerEvents: 'none',
        }}
      >
        <div className="font-medium text-gray-900 dark:text-white mb-2">
          Month {selected.month}
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-500">Principal:</span>
          <span>{formatCurrency(selected.principal, selectedCurrency)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-red-500">Interest:</span>
          <span>{formatCurrency(selected.interest, selectedCurrency)}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-80 relative" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
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
            {/* Always show a vertical ReferenceLine at the selected month */}
            {selected && (
              <ReferenceLine x={selected.month} stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 2" />
            )}
          </AreaChart>
        </ResponsiveContainer>
        {/* Always render the plus button at the selected month position */}
        {selected && (
          <button
            className="absolute z-10 px-2 py-1 rounded-full bg-blue-600 text-white text-xs hover:bg-blue-700 focus:outline-none shadow-lg"
            style={{
              left: selected.x - 16,
              top: selected.y - 16,
              pointerEvents: 'auto',
              transition: 'top 0.1s, left 0.1s',
            }}
            onClick={() => setModalMonth(selected.month)}
          >
            ➕
          </button>
        )}
        {/* Always render the custom tooltip for the selected month */}
        {renderCustomTooltip(selected)}
        {/* Modal for lump sum/EMI input */}
        {modalMonth !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-xs relative">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Modify Payment - Month {modalMonth}</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lump Sum Prepayment</label>
                <input
                  type="number"
                  min="0"
                  className="input-field w-full"
                  placeholder="Enter amount (₹)"
                  value={lumpSum}
                  onChange={e => setLumpSum(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Increase EMI by (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="input-field w-full"
                  placeholder="Enter increase amount (₹)"
                  value={newEmi}
                  onChange={e => setNewEmi(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleModalConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Savings/impact summary */}
      <div className="mt-4 flex flex-col md:flex-row md:space-x-8 items-start md:items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="mb-2 md:mb-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">Original Total Interest</div>
          <div className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(originalSchedule[originalSchedule.length-1]?.cumulativeInterest || 0, selectedCurrency)}</div>
        </div>
        <div className="mb-2 md:mb-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">Modified Total Interest</div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(schedule[schedule.length-1]?.cumulativeInterest || 0, selectedCurrency)}</div>
        </div>
        <div className="mb-2 md:mb-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">Interest Saved</div>
          <div className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(savings.interestSaved, selectedCurrency)}</div>
        </div>
        <div className="mb-2 md:mb-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">Original Months</div>
          <div className="font-semibold">{originalSchedule.length}</div>
        </div>
        <div className="mb-2 md:mb-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">Modified Months</div>
          <div className="font-semibold">{schedule.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Months Reduced</div>
          <div className="font-semibold text-green-600 dark:text-green-400">{savings.timeSaved}</div>
        </div>
      </div>
    </>
  );
};

export default PlaygroundAmortizationChart; 