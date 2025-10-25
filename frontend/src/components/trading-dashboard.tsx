"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { PositionsList } from './positions-list';
import { OpenPositionForm } from './open-position-form';
import { MarketStats } from './market-stats';
import { PnLDisplay } from './pnl-display';
import { portfolioService } from '@/services/portfolio.service';
import { Position } from '@/services/trading.service';

export function TradingDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'wallet'>('trade');
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch portfolio data (includes wallet, positions, stats)
      const portfolioData = await portfolioService.getPortfolio();
      setPortfolio(portfolioData);
      setPositions(portfolioData.positions || []);

    } catch (error: any) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUserData();
  }, [refreshKey]);

  // Auto-refresh positions every 5 seconds for real-time PnL
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading && !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SuperAI Perp</h1>
              <p className="text-sm text-slate-400">AI-Powered Perpetual Futures</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                title="Refresh data"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* PnL Display */}
        {portfolio && <PnLDisplay portfolio={portfolio} />}

        {/* Market Stats */}
        <MarketStats />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {(['trade', 'positions', 'wallet'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'trade' && '📈 Trade'}
              {tab === 'positions' && '📊 Positions'}
              {tab === 'wallet' && '💰 Wallet'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'trade' && (
            <OpenPositionForm
              onSuccess={() => {
                handleRefresh();
              }}
              availableBalance={portfolio?.wallet?.available || 0}
            />
          )}

          {activeTab === 'positions' && (
            <PositionsList
              positions={positions}
              loading={loading}
              onClose={() => handleRefresh()}
            />
          )}

          {activeTab === 'wallet' && portfolio?.wallet && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Wallet Management</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Balance</p>
                  <p className="text-xl font-bold text-white">
                    ${portfolio.wallet.balance.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Locked</p>
                  <p className="text-xl font-bold text-orange-400">
                    ${portfolio.wallet.locked.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Available</p>
                  <p className="text-xl font-bold text-green-400">
                    ${portfolio.wallet.available.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Equity</p>
                  <p className="text-xl font-bold text-blue-400">
                    ${portfolio.wallet.equity.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-300">
                  💡 <strong>Test Mode:</strong> Use test transactions for development.
                  Real TON testnet integration coming soon!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Deposit */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">💵 Deposit USDT</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Deposit using test transaction
                  </p>
                  <input
                    type="number"
                    placeholder="Amount (USDT)"
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="deposit-amount"
                  />
                  <button
                    onClick={async () => {
                      const amount = (document.getElementById('deposit-amount') as HTMLInputElement)?.value;
                      if (!amount || parseFloat(amount) <= 0) {
                        alert('Please enter a valid amount');
                        return;
                      }
                      // TODO: Implement deposit with walletService
                      alert(`Deposit ${amount} USDT - Feature coming soon!`);
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Deposit (Test Mode)
                  </button>
                </div>

                {/* Withdraw */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">💸 Withdraw USDT</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Withdraw to TON address (Fee: 0.5 USDT)
                  </p>
                  <input
                    type="number"
                    placeholder="Amount (USDT)"
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="withdraw-amount"
                  />
                  <input
                    type="text"
                    placeholder="TON Address"
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="withdraw-address"
                  />
                  <button
                    onClick={async () => {
                      const amount = (document.getElementById('withdraw-amount') as HTMLInputElement)?.value;
                      const address = (document.getElementById('withdraw-address') as HTMLInputElement)?.value;
                      if (!amount || parseFloat(amount) <= 0) {
                        alert('Please enter a valid amount');
                        return;
                      }
                      if (!address) {
                        alert('Please enter TON address');
                        return;
                      }
                      // TODO: Implement withdraw with walletService
                      alert(`Withdraw ${amount} USDT - Feature coming soon!`);
                    }}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
