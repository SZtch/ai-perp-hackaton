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

      // Parse and validate the deposit address
      let parsedAddress: Address;
      try {
        parsedAddress = Address.parse(depositAddress);
      } catch (e) {
        toast.error('Invalid deposit address format');
        console.error('[Deposit] Address parse error:', e);
        return;
      }

      // Construct transfer message
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: parsedAddress.toString({ bounceable: true, testOnly: true }), // Format for testnet
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
      console.log('[Deposit] Parsed address:', parsedAddress.toString({ bounceable: true, testOnly: true }));

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
    <div className="relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
          <span className="text-2xl">💵</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Deposit USDT</h3>
          <p className="text-xs text-slate-400">Add funds to your account</p>
        </div>
      </div>

      {/* Wallet Status */}
      {wallet ? (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-3.5 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
          <div className="relative flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">✅</span>
            </div>
            <p className="text-xs text-green-200 flex-1">
              <strong className="text-green-300">Wallet Connected:</strong>{' '}
              <code className="text-green-400 font-mono">{wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-6)}</code>
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-3.5 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5" />
          <div className="relative flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">⚠️</span>
            </div>
            <p className="text-xs text-yellow-200">
              Please connect your TON wallet to enable blockchain deposits
            </p>
          </div>
        </div>
      )}

      {/* Deposit Address Info */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-4 mb-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-xs">📍</span>
            </div>
            <p className="text-sm font-semibold text-blue-300">
              Deposit Address (TON Testnet)
            </p>
          </div>
          <p className="text-xs text-blue-200/80 mb-3">
            Kirim USDT ke address platform ini untuk deposit
          </p>
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-2.5 border border-blue-500/20">
            {depositAddress ? (
              <>
                <code className="text-xs text-green-400 flex-1 overflow-x-auto break-all font-mono">
                  {depositAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                  title="Copy address"
                >
                  <span className="text-sm">📋</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400 text-xs py-1">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400/30 border-t-yellow-400"></div>
                <span>Memuat address platform...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">
            Amount (USDT)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3.5 bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 focus:border-blue-500/50 text-white rounded-lg text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all tabular-nums"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
              USDT
            </div>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">
            Quick Amount
          </label>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-2.5 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/50 hover:border-slate-500/50 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                ${quickAmount >= 1000 ? `${quickAmount / 1000}k` : quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Blockchain Deposit Button */}
          <button
            type="button"
            onClick={handleBlockchainDeposit}
            disabled={loading || !amount || !wallet}
            className="group relative w-full px-5 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:shadow-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-base">🔗</span>
                  <span>Deposit via Wallet</span>
                  {amount && <span className="text-blue-100">($${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>}
                </>
              )}
            </span>
          </button>

          {/* Test Deposit Button */}
          <button
            type="button"
            onClick={handleTestDeposit}
            disabled={loading || !amount}
            className="w-full px-5 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 hover:border-purple-500/60 disabled:bg-slate-700/50 disabled:border-slate-600/50 disabled:cursor-not-allowed text-purple-300 hover:text-purple-200 disabled:text-slate-500 font-semibold rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400/30 border-t-purple-400"></div>
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>⚡</span>
                <span>Test Deposit (Instant)</span>
              </span>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="relative overflow-hidden rounded-lg bg-slate-700/30 border border-slate-600/30 p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-lg bg-slate-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                How it works:
              </p>
              <ol className="text-xs text-slate-400 space-y-1.5 ml-4 list-decimal">
                <li>Enter deposit amount</li>
                <li>Click "Deposit via Wallet"</li>
                <li>Approve transaction in your TON wallet</li>
                <li>Balance will be credited automatically</li>
              </ol>
              <p className="text-xs text-slate-500 mt-3 italic flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                Use "Test Deposit" for instant testing without blockchain transaction
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
