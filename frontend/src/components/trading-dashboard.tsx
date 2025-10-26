"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { PositionsList } from './positions-list';
import { OpenPositionForm } from './open-position-form';
import { MarketStats } from './market-stats';
// import { PriceChart } from './price-chart'; // Temporarily disabled
import { PnLDisplay } from './pnl-display';
import { WalletDeposit } from './wallet-deposit';
import { WalletWithdraw } from './wallet-withdraw';
import { FaucetClaim } from './faucet-claim';
import { portfolioService } from '@/services/portfolio.service';
import { Position } from '@/services/trading.service';

export function TradingDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'wallet'>('trade');
  // const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT'); // Temporarily disabled for chart
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

        {/* Price Chart - Temporarily disabled for debugging
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Chart Symbol:</span>
            {['BTCUSDT', 'ETHUSDT', 'TONUSDT'].map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedSymbol === symbol
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
          <PriceChart symbol={selectedSymbol} height={350} />
        </div>
        */}

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
            <div className="space-y-6">
              {/* Testnet Faucet - Featured at Top */}
              <FaucetClaim onSuccess={handleRefresh} />

              {/* Balance Cards */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">💰 Wallet Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </div>

              {/* Deposit & Withdraw */}
              <div className="grid md:grid-cols-2 gap-6">
                <WalletDeposit onSuccess={handleRefresh} />
                <WalletWithdraw
                  availableBalance={portfolio.wallet.available}
                  onSuccess={handleRefresh}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
