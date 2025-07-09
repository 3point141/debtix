import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { PaymentSchedule } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useLoanStore } from '../../store/loanStore';

interface PaymentScheduleTableProps {
  schedule: PaymentSchedule[];
}

const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ schedule }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  // Filter schedule based on search term
  const filteredSchedule = schedule.filter((payment) =>
    payment.paymentNumber.toString().includes(searchTerm) ||
    formatDate(payment.date).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCurrency = useLoanStore((state) => state.selectedCurrency);
  // Calculate pagination
  const totalPages = Math.ceil(filteredSchedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredSchedule.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (schedule.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No payment schedule available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and pagination controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSchedule.length)} of {filteredSchedule.length} payments
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Principal
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Interest
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Remaining Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentPayments.map((payment) => (
              <tr
                key={payment.paymentNumber}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {payment.paymentNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(payment.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                  {formatCurrency(payment.paymentAmount, selectedCurrency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400">
                  {formatCurrency(payment.principalAmount, selectedCurrency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                  {formatCurrency(payment.interestAmount, selectedCurrency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(payment.remainingBalance, selectedCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentScheduleTable; 