import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { useLoanStore } from './store/loanStore';
import { useTheme } from './hooks/useTheme';

function App() {
  const { errors, clearErrors } = useLoanStore();
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error notifications */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex justify-between items-center">
              <div>
                <strong className="font-bold">Validation Errors:</strong>
                <ul className="mt-1 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={clearErrors}
                className="text-red-700 hover:text-red-900 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
          <MainContent />
        </div>
      </div>
    </div>
  );
}

export default App; 