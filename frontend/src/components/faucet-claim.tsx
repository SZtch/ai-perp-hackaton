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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 p-[1px] shadow-2xl shadow-purple-500/20">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-6">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse" />

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl">💧</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Testnet Faucet
                </h3>
                <p className="text-xs text-slate-400">Get free USDT for testing</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Amount</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ${faucetAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {!canClaim && cooldownSeconds > 0 ? (
            <div className="text-center">
              {/* Cooldown Display */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-5 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 animate-pulse" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center animate-pulse">
                      <span className="text-xl">⏱️</span>
                    </div>
                    <p className="text-sm font-semibold text-yellow-300">
                      Cooldown Active
                    </p>
                  </div>
                  <p className="text-xs text-yellow-200/80 mb-3">
                    Next claim available in
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-slate-900/50 rounded-lg px-4 py-2 backdrop-blur-sm border border-yellow-500/20">
                      <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent tabular-nums">
                        {formatTime(cooldownSeconds)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="w-full px-6 py-4 bg-slate-700/50 cursor-not-allowed text-slate-500 font-semibold rounded-xl border border-slate-600/50 transition-all"
              >
                Claim Unavailable
              </button>
            </div>
          ) : (
            <>
              {/* Info Box */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-4 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
                <div className="relative flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">💡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-200/90 leading-relaxed">
                      <strong className="text-blue-300">Free testnet USDT</strong> for hackathon testing. Claim once every 24 hours.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Instant credit
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        24h cooldown
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={loading || !canClaim}
                className="group relative w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:shadow-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">💧</span>
                      <span>Claim {faucetAmount.toLocaleString()} USDT</span>
                    </>
                  )}
                </span>
              </button>
            </>
          )}

          {/* Footer */}
          <p className="text-xs text-slate-600 text-center mt-4 flex items-center justify-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="italic">For Hackathon Demo & Testing Only</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          </p>
        </div>
      </div>
    </div>
  );
}
