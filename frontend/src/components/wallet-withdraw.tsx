"use client";

import { useState } from 'react';
import { walletService } from '@/services/wallet.service';
import { useToast } from '@/providers/toast-provider';

interface WalletWithdrawProps {
  availableBalance: number;
  onSuccess: () => void;
}

export function WalletWithdraw({ availableBalance, onSuccess }: WalletWithdrawProps) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const WITHDRAW_FEE = 0.5;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!address) {
      toast.error('Please enter TON address');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    const totalRequired = withdrawAmount + WITHDRAW_FEE;

    if (totalRequired > availableBalance) {
      toast.error(`Insufficient balance. Required: $${totalRequired.toFixed(2)} (including fee)`);
      return;
    }

    try {
      setLoading(true);

      await walletService.withdraw({
        amount: withdrawAmount,
        toAddress: address,
      });

      toast.success(`Successfully withdrew $${withdrawAmount.toFixed(2)} USDT!`);
      setAmount('');
      setAddress('');
      onSuccess();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      toast.error(error.response?.data?.error || 'Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (availableBalance > WITHDRAW_FEE) {
      setAmount((availableBalance - WITHDRAW_FEE).toFixed(2));
    } else {
      toast.warning('Insufficient balance for withdrawal');
    }
  };

  const totalRequired = amount ? parseFloat(amount) + WITHDRAW_FEE : 0;

  return (
    <div className="bg-slate-700/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💸</span>
        <h3 className="text-xl font-bold text-white">Withdraw USDT</h3>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <p className="text-sm text-yellow-300">
          <strong>⚠️ Withdrawal Fee:</strong> ${WITHDRAW_FEE} USDT per transaction
        </p>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">
              Amount (USDT)
            </label>
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Max: ${availableBalance.toFixed(2)}
            </button>
          </div>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            TON Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="EQ... or UQ..."
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            For testing, use: <code className="bg-slate-600 px-1 rounded">UQtest_withdraw_address</code>
          </p>
        </div>

        {/* Summary */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-slate-700/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Withdraw Amount:</span>
              <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Network Fee:</span>
              <span className="font-medium">${WITHDRAW_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold border-t border-slate-600 pt-2">
              <span>Total Required:</span>
              <span className={totalRequired > availableBalance ? 'text-red-400' : 'text-green-400'}>
                ${totalRequired.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>You will receive:</span>
              <span>${parseFloat(amount).toFixed(2)} USDT</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !amount || !address || totalRequired > availableBalance}
          className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            `Withdraw ${amount ? `$${parseFloat(amount).toFixed(2)}` : ''} USDT`
          )}
        </button>
      </form>
    </div>
  );
}
