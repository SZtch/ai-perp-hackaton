"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Sidebar } from './sidebar';
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
  const [darkMode, setDarkMode] = useState(true);
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

  const handleToggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Theme colors
  const theme = darkMode ? {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    bgSolid: 'bg-slate-900',
    bgSecondary: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    textTertiary: 'text-slate-500',
  } : {
    bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
    bgSolid: 'bg-white',
    bgSecondary: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
  };

  if (loading && !portfolio) {
    return (
      <div className={`h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={theme.textSecondary}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${theme.bg} ${theme.text} flex overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} onToggleTheme={handleToggleTheme} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`${theme.bgSolid} border-b ${theme.border} backdrop-blur-sm shrink-0`}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${theme.text}`}>SuperAI Perp</h1>
                <p className={`text-sm ${theme.textSecondary}`}>AI-Powered Perpetual Futures</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  className={`px-4 py-2 text-sm ${theme.textSecondary} hover:${theme.text} transition-colors`}
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

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Testnet Faucet Banner - Always Visible */}
            <FaucetClaim onSuccess={handleRefresh} />

            {/* PnL Display */}
            {portfolio && <PnLDisplay portfolio={portfolio} />}

            {/* Market Stats */}
            <MarketStats />

            {/* Price Chart - Temporarily disabled for debugging
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${theme.textSecondary}`}>Chart Symbol:</span>
                {['BTCUSDT', 'ETHUSDT', 'TONUSDT'].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedSymbol === symbol
                        ? 'bg-purple-500 text-white'
                        : `${theme.bgSecondary} ${theme.textSecondary} hover:${theme.bgSolid}`
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
            <div className={`flex gap-2 border-b ${theme.border}`}>
              {(['trade', 'positions', 'wallet'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-purple-400'
                      : `${theme.textSecondary} hover:${theme.text}`
                  }`}
                >
                  {tab === 'trade' && '📈 Trade'}
                  {tab === 'positions' && '📊 Positions'}
                  {tab === 'wallet' && '💰 Wallet'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
                  )}
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
                  {/* Balance Cards */}
                  <div className={`${theme.bgSecondary} rounded-lg p-6`}>
                    <h2 className={`text-xl font-bold ${theme.text} mb-4`}>💰 Wallet Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${theme.border}`}>
                        <p className={`text-sm ${theme.textSecondary} mb-1`}>Balance</p>
                        <p className={`text-xl font-bold ${theme.text}`}>
                          ${portfolio.wallet.balance.toFixed(2)}
                        </p>
                      </div>

                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${theme.border}`}>
                        <p className={`text-sm ${theme.textSecondary} mb-1`}>Locked</p>
                        <p className="text-xl font-bold text-orange-400">
                          ${portfolio.wallet.locked.toFixed(2)}
                        </p>
                      </div>

                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${theme.border}`}>
                        <p className={`text-sm ${theme.textSecondary} mb-1`}>Available</p>
                        <p className="text-xl font-bold text-green-400">
                          ${portfolio.wallet.available.toFixed(2)}
                        </p>
                      </div>

                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${theme.border}`}>
                        <p className={`text-sm ${theme.textSecondary} mb-1`}>Equity</p>
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
      </div>
    </div>
  );
}
