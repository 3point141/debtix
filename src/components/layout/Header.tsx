import React from 'react';
import { motion } from 'framer-motion';
import { Download, Save, Settings, Moon, Sun } from 'lucide-react';
import { useLoanStore } from '../../store/loanStore';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDarkMode = false }) => {
  const { currentSummary, createScenario } = useLoanStore();

  const handleSaveScenario = () => {
    const name = prompt('Enter a name for this scenario:');
    if (name) {
      createScenario(name);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LV</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Loan Visualizer
            </h1>
          </div>
          
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveScenario}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Scenario</span>
          </button>
          
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 