"use client";

import { useState } from 'react';
import { walletService } from '@/services/wallet.service';
import { useToast } from '@/providers/toast-provider';

interface WalletDepositProps {
  onSuccess: () => void;
}

export function WalletDeposit({ onSuccess }: WalletDepositProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      // For test mode: use test transaction hash
      const txHash = `test_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await walletService.confirmDeposit({
        amount: parseFloat(amount),
        txHash,
      });

      toast.success(`Successfully deposited $${parseFloat(amount).toFixed(2)} USDT!`);
      setAmount('');
      onSuccess();
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.response?.data?.error || 'Failed to deposit');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="bg-slate-700/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💵</span>
        <h3 className="text-xl font-bold text-white">Deposit USDT</h3>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-300">
          <strong>📘 Test Mode:</strong> Deposits are instant for testing. In production, this
          will verify real TON testnet transactions.
        </p>
      </div>

      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount (USDT)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick amount buttons */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Quick Amount
          </label>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
              >
                ${quickAmount >= 1000 ? `${quickAmount / 1000}k` : quickAmount}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            `Deposit ${amount ? `$${parseFloat(amount).toFixed(2)}` : ''} USDT`
          )}
        </button>
      </form>
    </div>
  );
}
