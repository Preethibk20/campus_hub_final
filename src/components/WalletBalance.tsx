import React from 'react';
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface WalletBalanceProps {
  balance: number;
  earnings?: number;
  spent?: number;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  earnings = 0,
  spent = 0,
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm opacity-90">Available Balance</p>
            <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ArrowDownRight className="w-4 h-4 text-green-300" />
            <TrendingUp className="w-4 h-4 text-green-300" />
          </div>
          <p className="text-xs opacity-75">Total Earnings</p>
          <p className="text-lg font-semibold">₹{earnings.toFixed(2)}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-red-300" />
          </div>
          <p className="text-xs opacity-75">Total Spent</p>
          <p className="text-lg font-semibold">₹{spent.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <p className="text-xs opacity-75">Demo Wallet System</p>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
