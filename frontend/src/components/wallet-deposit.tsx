"use client";

import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { walletService } from '@/services/wallet.service';
import { useToast } from '@/providers/toast-provider';

interface WalletDepositProps {
  onSuccess: () => void;
}

export function WalletDeposit({ onSuccess }: WalletDepositProps) {
  const [amount, setAmount] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const toast = useToast();

  // Fetch deposit address on mount
  useEffect(() => {
    const fetchDepositInfo = async () => {
      try {
        const info = await walletService.getDepositInfo(100);
        setDepositAddress(info.depositAddress);
      } catch (error) {
        console.error('Error fetching deposit info:', error);
      }
    };
    fetchDepositInfo();
  }, []);

  /**
   * Handle blockchain deposit via TONConnect
   * This requests USDT transfer approval from user's wallet
   */
  const handleBlockchainDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!wallet) {
      toast.error('Please connect your TON wallet first');
      return;
    }

    if (!depositAddress) {
      toast.error('Deposit address not available');
      return;
    }

    try {
      setLoading(true);

      const depositAmount = parseFloat(amount);

      // For hackathon: Use simple TON transfer instead of Jetton
      // In production, this would be a Jetton transfer with proper payload

      // Construct transfer message
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: depositAddress,
            amount: toNano(0.05).toString(), // Small TON amount for gas
            payload: beginCell()
              .storeUint(0, 32) // op code for comment
              .storeStringTail(`USDT_DEPOSIT:${depositAmount}:${wallet.account.address}`)
              .endCell()
              .toBoc()
              .toString('base64'),
          },
        ],
      };

      console.log('[Deposit] Requesting transaction approval:', transaction);

      // Request transaction from wallet
      const result = await tonConnectUI.sendTransaction(transaction);

      console.log('[Deposit] Transaction sent:', result);

      // Extract BOC (Bag of Cells) from result
      const boc = result.boc;

      // For verification, we'll use a hash of the BOC as tx identifier
      // In production, you'd parse the actual tx hash from blockchain
      const txHash = `blockchain_${Date.now()}_${boc.slice(0, 16)}`;

      toast.success('Transaction sent! Verifying...');

      // Submit to backend for verification
      await walletService.confirmDeposit({
        amount: depositAmount,
        txHash: txHash,
      });

      toast.success(`Successfully deposited $${depositAmount.toFixed(2)} USDT!`);
      setAmount('');
      onSuccess();

    } catch (error: any) {
      console.error('Blockchain deposit error:', error);

      if (error.message?.includes('reject') || error.message?.includes('cancel')) {
        toast.error('Transaction cancelled by user');
      } else {
        toast.error(error.message || 'Failed to process deposit');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle test deposit (instant, no blockchain)
   */
  const handleTestDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      const testTxHash = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await walletService.confirmDeposit({
        amount: parseFloat(amount),
        txHash: testTxHash,
      });

      toast.success(`Test deposit of $${parseFloat(amount).toFixed(2)} USDT successful!`);
      setAmount('');
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

  return (
    <div className="bg-slate-700/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💵</span>
        <h3 className="text-xl font-bold text-white">Deposit USDT</h3>
      </div>

      {/* Wallet Status */}
      {wallet ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-green-300">
            ✅ <strong>Wallet Connected:</strong> {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-6)}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-300">
            ⚠️ Please connect your TON wallet to enable blockchain deposits
          </p>
        </div>
      )}

      {/* Deposit Address Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-300 mb-2">
          <strong>📍 Platform Wallet (TON Testnet):</strong>
        </p>
        <div className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2">
          <code className="text-xs text-green-400 flex-1 overflow-x-auto">
            {depositAddress || 'Loading...'}
          </code>
          {depositAddress && (
            <button
              onClick={copyAddress}
              className="text-blue-400 hover:text-blue-300 text-sm flex-shrink-0"
              title="Copy address"
            >
              📋
            </button>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
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

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Blockchain Deposit Button */}
          <button
            type="button"
            onClick={handleBlockchainDeposit}
            disabled={loading || !amount || !wallet}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                🔗 Deposit via Wallet
                {amount && ` ($${parseFloat(amount).toFixed(2)})`}
              </>
            )}
          </button>

          {/* Test Deposit Button */}
          <button
            type="button"
            onClick={handleTestDeposit}
            disabled={loading || !amount}
            className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 disabled:bg-slate-600 disabled:border-slate-600 disabled:cursor-not-allowed text-purple-300 font-bold rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : '⚡ Test Deposit (Instant)'}
          </button>
        </div>

        {/* Info */}
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-2">
            <strong className="text-slate-300">💡 How it works:</strong>
          </p>
          <ol className="text-xs text-slate-400 space-y-1 ml-4 list-decimal">
            <li>Enter deposit amount</li>
            <li>Click "Deposit via Wallet"</li>
            <li>Approve transaction in your TON wallet</li>
            <li>Balance will be credited automatically</li>
          </ol>
          <p className="text-xs text-slate-500 mt-2 italic">
            Use "Test Deposit" for instant testing without blockchain transaction
          </p>
        </div>
      </form>
    </div>
  );
}
