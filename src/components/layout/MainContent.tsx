import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Table, TrendingUp, FlaskConical } from 'lucide-react';
import { useLoanStore } from '../../store/loanStore';
import { generateAmortizationSchedule, calculateLoanSummary } from '../../utils/calculations';
import SummaryCards from '../ui/SummaryCards';
import AmortizationChart from '../charts/AmortizationChart';
import PaymentBreakdownChart from '../charts/PaymentBreakdownChart';
import PaymentScheduleTable from '../ui/PaymentScheduleTable';
import PlaygroundAmortizationChart from '../charts/PlaygroundAmortizationChart';

type TabType = 'overview' | 'charts' | 'schedule' | 'comparison' | 'playground';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const currentLoan = useLoanStore((state) => state.currentLoan);
  const errors = useLoanStore((state) => state.errors);
  const currentSchedule = generateAmortizationSchedule(currentLoan);
  const currentSummary = calculateLoanSummary(currentSchedule, currentLoan);
  const isValid = errors.length === 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'schedule', label: 'Payment Schedule', icon: Table },
    { id: 'playground', label: 'Playground', icon: FlaskConical }, // moved to 4th
    { id: 'comparison', label: 'Comparison', icon: PieChart },
  ] as const;

  if (!isValid) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Enter Loan Details
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please fill in the loan parameters in the sidebar to see your amortization schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary Cards */}
      <div className="p-6 pb-0">
        <SummaryCards summary={currentSummary} />
      </div>

      {/* Tab Navigation */}
      <div className="px-6 pt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Amortization Overview
                </h3>
                <AmortizationChart schedule={currentSchedule} />
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Breakdown
                </h3>
                <PaymentBreakdownChart schedule={currentSchedule} />
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Principal vs Interest Over Time
                </h3>
                <AmortizationChart schedule={currentSchedule} />
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Composition
                </h3>
                <PaymentBreakdownChart schedule={currentSchedule} />
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Schedule
                </h3>
              </div>
              <div className="max-h-96 overflow-auto">
                <PaymentScheduleTable schedule={currentSchedule} />
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Scenario Comparison
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Save different scenarios to compare them here.
                </p>
                <button className="btn-primary">
                  Create First Scenario
                </button>
              </div>
            </div>
          )}

          {activeTab === 'playground' && (
            <div className="py-6"><PlaygroundAmortizationChart /></div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MainContent; 