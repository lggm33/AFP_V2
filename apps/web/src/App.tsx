// AFP Finance App - Main App Component
import React from 'react';
import type { BudgetCategory, Transaction } from '@afp/shared-types';

export function App() {
  // Test shared types usage
  const [transactions] = React.useState<Transaction[]>([]);
  const [categories] = React.useState<BudgetCategory[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AFP Finance App
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Welcome to AFP Finance
                </h2>
                <p className="text-gray-500">
                  Personal Finance with AI-Powered Email Analysis
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  <p>Transactions: {transactions.length}</p>
                  <p>Categories: {categories.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
