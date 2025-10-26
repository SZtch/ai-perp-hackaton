"use client";

import { useState, useEffect } from 'react';
import { faucetService } from '@/services/faucet.service';
import { useToast } from '@/providers/toast-provider';

interface FaucetClaimProps {
  onSuccess: () => void;
}

export function FaucetClaim({ onSuccess }: FaucetClaimProps) {
  const [loading, setLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [faucetAmount, setFaucetAmount] = useState(1000);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const toast = useToast();

  // Fetch faucet info on mount
  useEffect(() => {
    fetchFaucetInfo();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          fetchFaucetInfo(); // Refresh when cooldown ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const fetchFaucetInfo = async () => {
    try {
      const info = await faucetService.getInfo();
      setCanClaim(info.canClaim);
      setFaucetAmount(info.faucetAmount);
      setTimeUntilNext(info.timeUntilNextClaimMs);

      if (!info.canClaim && info.timeUntilNextClaimMs > 0) {
        setCooldownSeconds(Math.ceil(info.timeUntilNextClaimMs / 1000));
      } else {
        setCooldownSeconds(0);
      }
    } catch (error) {
      console.error('Error fetching faucet info:', error);
    }
  };

  const handleClaim = async () => {
    try {
      setLoading(true);

      const result = await faucetService.claim();

      toast.success(
        `${result.message} New balance: $${result.newBalance.toFixed(2)}`
      );

      // Set cooldown
      setCooldownSeconds(24 * 60 * 60); // 24 hours
      setCanClaim(false);

      onSuccess();
    } catch (error: any) {
      console.error('Faucet claim error:', error);

      if (error.response?.status === 429) {
        const timeRemaining = error.response.data.timeRemainingMs || 0;
        setCooldownSeconds(Math.ceil(timeRemaining / 1000));
        toast.error(error.response.data.message || 'Please wait before claiming again');
      } else {
        toast.error(error.response?.data?.error || 'Failed to claim from faucet');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">💧</span>
        <div>
          <h3 className="text-xl font-bold text-white">Testnet Faucet</h3>
          <p className="text-xs text-slate-400">Get free USDT for testing</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Faucet Amount:</span>
          <span className="text-lg font-bold text-green-400">
            ${faucetAmount.toLocaleString()} USDT
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Cooldown:</span>
          <span className="text-sm text-slate-400">24 hours</span>
        </div>
      </div>

      {!canClaim && cooldownSeconds > 0 ? (
        <div className="text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-300 mb-1">
              ⏱️ <strong>Cooldown Active</strong>
            </p>
            <p className="text-xs text-yellow-200">
              Next claim available in
            </p>
            <p className="text-2xl font-bold text-yellow-400 mt-2">
              {formatTime(cooldownSeconds)}
            </p>
          </div>

          <button
            disabled
            className="w-full px-4 py-3 bg-slate-600 cursor-not-allowed text-slate-400 font-bold rounded-lg"
          >
            Claim Unavailable
          </button>
        </div>
      ) : (
        <>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-300">
              💡 <strong>Free testnet USDT</strong> for hackathon testing. Claim once per 24 hours.
            </p>
          </div>

          <button
            onClick={handleClaim}
            disabled={loading || !canClaim}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Claiming...
              </span>
            ) : (
              `💧 Claim ${faucetAmount.toLocaleString()} USDT`
            )}
          </button>
        </>
      )}

      <p className="text-xs text-slate-500 text-center mt-3 italic">
        For Hackathon Demo & Testing Only
      </p>
    </div>
  );
}
