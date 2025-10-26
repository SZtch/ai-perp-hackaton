"use client";

import { useState, useEffect } from 'react';
import { walletService } from '@/services/wallet.service';
import { useToast } from '@/providers/toast-provider';

interface WalletDepositProps {
  onSuccess: () => void;
}

export function WalletDeposit({ onSuccess }: WalletDepositProps) {
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTxInput, setShowTxInput] = useState(false);
  const toast = useToast();

  // Fetch deposit address on mount
  useEffect(() => {
    const fetchDepositInfo = async () => {
      try {
        const info = await walletService.getDepositInfo(100); // Default amount for info
        setDepositAddress(info.depositAddress);
      } catch (error) {
        console.error('Error fetching deposit info:', error);
      }
    };
    fetchDepositInfo();
  }, []);

  const handleProceedToDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setShowTxInput(true);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!txHash) {
      toast.error('Please enter the transaction hash');
      return;
    }

    try {
      setLoading(true);

      await walletService.confirmDeposit({
        amount: parseFloat(amount),
        txHash,
      });

      toast.success(`Successfully deposited $${parseFloat(amount).toFixed(2)} USDT!`);
      setAmount('');
      setTxHash('');
      setShowTxInput(false);
      onSuccess();
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.response?.data?.error || 'Failed to verify deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      // Generate test transaction hash
      const testTxHash = `test_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await walletService.confirmDeposit({
        amount: parseFloat(amount),
        txHash: testTxHash,
      });

      toast.success(`Test deposit of $${parseFloat(amount).toFixed(2)} USDT successful!`);
      setAmount('');
      setTxHash('');
      setShowTxInput(false);
      onSuccess();
    } catch (error: any) {
      console.error('Test deposit error:', error);
      toast.error(error.response?.data?.error || 'Failed to process test deposit');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    toast.success('Address copied to clipboard!');
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  if (showTxInput) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💵</span>
            <h3 className="text-xl font-bold text-white">Confirm Deposit</h3>
          </div>
          <button
            onClick={() => setShowTxInput(false)}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-300 mb-2">
            <strong>⚠️ After sending ${amount} USDT:</strong>
          </p>
          <ol className="text-xs text-yellow-200 space-y-1 ml-4 list-decimal">
            <li>Wait for transaction confirmation (10-30 seconds)</li>
            <li>Copy the transaction hash from your wallet</li>
            <li>Paste it below to verify and credit your balance</li>
          </ol>
        </div>

        <form onSubmit={handleConfirmDeposit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Transaction Hash
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste transaction hash here..."
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Find this in your wallet after sending the transaction
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !txHash}
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </span>
            ) : (
              `Verify & Credit $${parseFloat(amount).toFixed(2)} USDT`
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💵</span>
        <h3 className="text-xl font-bold text-white">Deposit USDT</h3>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-300 mb-2">
          <strong>📍 Deposit Address (TON Testnet):</strong>
        </p>
        <div className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2">
          <code className="text-xs text-green-400 flex-1 overflow-x-auto">
            {depositAddress || 'Loading...'}
          </code>
          {depositAddress && (
            <button
              onClick={copyAddress}
              className="text-blue-400 hover:text-blue-300 text-sm"
              title="Copy address"
            >
              📋
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          ⚠️ Send <strong>USDT Jetton</strong> on <strong>TON Testnet</strong> only!
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleProceedToDeposit(); }} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={!amount}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Proceed to Deposit
          </button>

          <button
            type="button"
            onClick={handleTestDeposit}
            disabled={loading || !amount}
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 disabled:bg-slate-600 disabled:border-slate-600 disabled:cursor-not-allowed text-purple-300 font-bold rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Test Deposit'}
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center">
          💡 Use "Test Deposit" for instant credit without blockchain transaction
        </p>
      </form>
    </div>
  );
}
