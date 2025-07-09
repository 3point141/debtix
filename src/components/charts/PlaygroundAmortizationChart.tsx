import React, { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
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
  ReferenceDot,
  Customized,
} from 'recharts';
import { useLoanStore } from '../../store/loanStore';
import { formatCurrency } from '../../utils/formatters';
import { generateAmortizationSchedule, calculateSavings } from '../../utils/calculations';
import { FaMoneyBillWave, FaArrowUp } from 'react-icons/fa';

// SVG icon for lump sum
export const FlashPayment = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
    <g fill="none" strokeLinecap="round" strokeWidth="4">
      <path fill="#2F88FF" stroke="#000" strokeLinejoin="round" d="M31 4H16L10 27H18L14 44L40 16H28L31 4Z"></path>
      <path stroke="#fff" d="M21 11L19 19"></path>
    </g>
  </svg>
);
// SVG icon for EMI increase
export const UpArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64" {...props}>
    <circle cx="32" cy="32" r="30" fill="#4fd1d9"></circle>
    <path fill="#fff" d="M48 30.3L32 15L16 30.3h10.6V49h10.3V30.3z"></path>
  </svg>
);

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
  // Chart container ref and dimensions
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDims, setChartDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setChartDims({ width: rect.width, height: rect.height });
    }
  }, [chartRef.current, schedule]);

  // Remove xScaleRef approach. Use state to store icon positions.
  const [iconPositions, setIconPositions] = useState<Array<{ month: number; x: number }>>([]);

  // Customized layer to calculate x positions
  const IconPositionLayer = (props: any) => {
    const { xAxisMap } = props;
    const xScale = xAxisMap[0].scale;
    const positions = interventions.map((intervention) => ({
      month: intervention.month,
      x: xScale(intervention.month),
    }));
    // Only update if changed
    useEffect(() => {
      setIconPositions(positions);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(positions)]);
    return null;
  };

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

  // Gather all intervention months and their details
  const interventions = useMemo(() => {
    const lumpSums = (currentLoan.extraPayments || []).map(ep => ({
      month: ep.month,
      type: 'lumpSum',
      amount: ep.amount,
    }));
    const emiIncreases = (currentLoan.rateChanges || [])
      .filter(rc => rc.newEMI && rc.newEMI > 0)
      .map(rc => ({
        month: rc.month,
        type: 'emiIncrease',
        amount: rc.newEMI,
        emiIncreaseBy: rc.emiIncreaseBy, // include the 'increase by' value
      }));
    // Combine by month
    const byMonth: Record<number, { lumpSum?: number; emiIncrease?: number; emiIncreaseBy?: number }> = {};
    lumpSums.forEach(({ month, amount }) => {
      if (!byMonth[month]) byMonth[month] = {};
      byMonth[month].lumpSum = amount;
    });
    emiIncreases.forEach(({ month, amount, emiIncreaseBy }) => {
      if (!byMonth[month]) byMonth[month] = {};
      byMonth[month].emiIncrease = amount;
      byMonth[month].emiIncreaseBy = emiIncreaseBy;
    });
    return Object.entries(byMonth).map(([month, v]) => ({
      month: Number(month),
      ...v,
    }));
  }, [currentLoan]);

  // Tooltip state for intervention markers
  const [markerTooltip, setMarkerTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

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
        addRateChange(modalMonth, 0, undefined, newEmiValue, increaseAmount); // pass increaseAmount as emiIncreaseBy
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

  // Tooltip state for intervention icons
  const [iconTooltip, setIconTooltip] = useState<{ x: number; content: string } | null>(null);

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
            {/* Customized layer to calculate icon positions */}
            <Customized component={IconPositionLayer} />
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
        {/* Permanent intervention overlays (do not interfere with + icon) */}
        {/* (No longer needed, handled by custom SVG layer) */}
        {markerTooltip && (
          <div
            className="absolute z-40 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{ left: markerTooltip.x, top: markerTooltip.y }}
          >
            {markerTooltip.content.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
        {/* Absolutely positioned intervention icons above the chart */}
        {iconPositions.length === interventions.length && interventions.map((intervention, idx) => {
          const pos = iconPositions[idx];
          if (!pos) return null;
          const x = pos.x;
          let tooltip = '';
          if (intervention.lumpSum && intervention.emiIncrease) {
            tooltip = `Lump sum: ₹${intervention.lumpSum.toLocaleString()}\nEMI increased by: ₹${intervention.emiIncreaseBy ? intervention.emiIncreaseBy.toLocaleString() : ''}`;
          } else if (intervention.lumpSum) {
            tooltip = `Lump sum: ₹${intervention.lumpSum.toLocaleString()}`;
          } else if (intervention.emiIncrease) {
            tooltip = `EMI increased by: ₹${intervention.emiIncreaseBy ? intervention.emiIncreaseBy.toLocaleString() : ''}`;
          }
          return (
            <div
              key={intervention.month}
              className="absolute z-30 cursor-pointer"
              style={{ left: x - 12, top: 0 }}
              onMouseEnter={() => setIconTooltip({ x, content: tooltip })}
              onMouseLeave={() => setIconTooltip(null)}
            >
              {/* Lump sum: FlashPayment SVG */}
              {intervention.lumpSum && (
                <svg width="24" height="24" viewBox="0 0 48 48">
                  <g fill="none" strokeLinecap="round" strokeWidth="4">
                    <path fill="#2F88FF" stroke="#000" strokeLinejoin="round" d="M31 4H16L10 27H18L14 44L40 16H28L31 4Z"></path>
                    <path stroke="#fff" d="M21 11L19 19"></path>
                  </g>
                </svg>
              )}
              {/* EMI increase: UpArrow SVG */}
              {intervention.emiIncrease && (
                <svg width="28" height="28" viewBox="0 0 64 64" style={{ marginLeft: intervention.lumpSum ? 8 : 0 }}>
                  <circle cx="32" cy="32" r="30" fill="#4fd1d9"></circle>
                  <path fill="#fff" d="M48 30.3L32 15L16 30.3h10.6V49h10.3V30.3z"></path>
                </svg>
              )}
            </div>
          );
        })}
        {/* Tooltip for intervention icons */}
        {iconTooltip && (
          <div
            className="absolute z-40 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{ left: iconTooltip.x, top: 36 }}
          >
            {iconTooltip.content.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
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