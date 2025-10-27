"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BarChart2, Settings, Maximize2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useToast } from '@/providers/toast-provider';
import { tradingService, Position, PriceData } from '@/services/trading.service';
import { portfolioService } from '@/services/portfolio.service';
import { faucetService } from '@/services/faucet.service';

// Import new components
import { SidebarNav } from './sidebar-nav';
import { HeaderStats } from './header-stats';
import { TradingPanel } from './trading-panel';
import { PositionsTable } from './positions-table';
import { generateCandlestickData } from './utils';

// Dynamic import for ChartSection to avoid SSR issues
const ChartSection = dynamic(() => import('./chart-section').then(mod => ({ default: mod.ChartSection })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading chart...</p>
      </div>
    </div>
  ),
});

export function TradingDashboard() {
  const { logout } = useAuth();
  const toast = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const tonAddress = useTonAddress();

  // UI State
  const [activeTab, setActiveTab] = useState('Market');
  const [orderType, setOrderType] = useState<'Long' | 'Short'>('Long');
  const [timeframe, setTimeframe] = useState('1h');
  const [positionTab, setPositionTab] = useState('Positions');
  const [orderSize, setOrderSize] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('ETHUSDT');
  const [leverage, setLeverage] = useState(50);

  // Backend Data
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Faucet state
  const [canClaim, setCanClaim] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Fetch portfolio data (wallet, positions, stats)
  const fetchPortfolio = async () => {
    try {
      const portfolioData = await portfolioService.getPortfolio();
      setPortfolio(portfolioData);
      setPositions(portfolioData.positions || []);
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
    }
  };

  // Fetch market prices
  const fetchPrices = async () => {
    try {
      const pricesData = await tradingService.getAllPrices();
      setPrices(pricesData);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  // Fetch faucet info
  const fetchFaucetInfo = async () => {
    try {
      const info = await faucetService.getInfo();
      setCanClaim(info.canClaim);

      if (!info.canClaim && info.timeUntilNextClaimMs > 0) {
        setCooldownSeconds(Math.ceil(info.timeUntilNextClaimMs / 1000));
      } else {
        setCooldownSeconds(0);
      }
    } catch (error) {
      console.error('Error fetching faucet info:', error);
    }
  };

  // Handle faucet claim
  const handleFaucetClaim = async () => {
    try {
      setFaucetLoading(true);
      const result = await faucetService.claim();
      toast.success(`${result.message} New balance: $${result.newBalance.toFixed(2)}`);
      setCooldownSeconds(24 * 60 * 60); // 24 hours
      setCanClaim(false);
      await fetchPortfolio();
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      if (error.response?.status === 429) {
        const timeRemaining = error.response.data.timeRemainingMs || 0;
        setCooldownSeconds(Math.ceil(timeRemaining / 1000));
        toast.error(error.response.data.message || 'Please wait before claiming again');
      } else {
        toast.error(error.response?.data?.message || 'Failed to claim faucet');
      }
    } finally {
      setFaucetLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPortfolio(), fetchPrices(), fetchFaucetInfo()]).finally(() => setLoading(false));
  }, []);

  // Auto-refresh positions every 5 seconds for real-time PnL
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPortfolio();
      fetchPrices();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for faucet cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          fetchFaucetInfo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Update order size when percentage changes
  useEffect(() => {
    if (portfolio?.wallet?.available && percentage > 0) {
      const availableBalance = portfolio.wallet.available;
      const calculatedSize = (availableBalance * percentage / 100) * leverage;
      setOrderSize(calculatedSize.toFixed(2));
    }
  }, [percentage, portfolio, leverage]);

  // TON Wallet connection handlers
  const connectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Handle opening position
  const handleOpenPosition = async () => {
    if (!orderSize || parseFloat(orderSize) <= 0) {
      toast.error('Please enter a valid position size');
      return;
    }

    const size = parseFloat(orderSize);
    const requiredMargin = size / leverage;
    const fee = size * 0.001; // 0.1% taker fee
    const totalRequired = requiredMargin + fee;

    if (totalRequired > (portfolio?.wallet?.available || 0)) {
      toast.error(`Insufficient balance. Required: $${totalRequired.toFixed(2)}`);
      return;
    }

    try {
      setOrderLoading(true);

      await tradingService.createOrder({
        symbol: selectedSymbol,
        side: orderType === 'Long' ? 'BUY' : 'SELL',
        type: 'MARKET',
        size: size,
        leverage: leverage,
      });

      toast.success(`${orderType} position opened successfully!`);
      setOrderSize('');
      setPercentage(0);
      await fetchPortfolio();
    } catch (error: any) {
      console.error('Error opening position:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to open position';
      toast.error(errorMsg);
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle closing position
  const handleClosePosition = async (positionId: string) => {
    try {
      await tradingService.closePosition(positionId);
      toast.success('Position closed successfully!');
      await fetchPortfolio();
    } catch (error: any) {
      console.error('Error closing position:', error);
      toast.error(error.response?.data?.error || 'Failed to close position');
    }
  };

  // Close all positions
  const handleCloseAllPositions = async () => {
    if (positions.length === 0) return;

    try {
      const closePromises = positions.map(pos => tradingService.closePosition(pos.id));
      await Promise.all(closePromises);
      toast.success('All positions closed successfully!');
      await fetchPortfolio();
    } catch (error: any) {
      console.error('Error closing all positions:', error);
      toast.error('Failed to close all positions');
    }
  };

  // Generate candlestick data
  const currentPrice = prices[selectedSymbol]?.price || 3500;
  const candlestickData = generateCandlestickData(currentPrice, 120);
  const availableBalance = portfolio?.wallet?.available || 0;

  // Theme colors
  const theme = darkMode ? {
    bg: 'bg-[#0d0e12]',
    bgSecondary: 'bg-[#14151b]',
    bgTertiary: 'bg-[#1a1c24]',
    border: 'border-[#1e1f26]',
    borderSecondary: 'border-[#25262e]',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-[#1f212a]',
  } : {
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50',
    bgTertiary: 'bg-gray-100',
    border: 'border-gray-200',
    borderSecondary: 'border-gray-300',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-gray-200',
  };

  // Loading state
  if (loading && !portfolio) {
    return (
      <div className={`h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center animate-fade-in-scale">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={`${theme.textSecondary} text-lg font-medium`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${theme.bg} ${theme.text} flex overflow-hidden font-sans`}>
      {/* Sidebar Navigation */}
      <SidebarNav
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Stats */}
        <HeaderStats
          darkMode={darkMode}
          selectedSymbol={selectedSymbol}
          leverage={leverage}
          currentPrice={currentPrice}
          wallet={wallet}
          tonAddress={tonAddress}
          portfolio={portfolio}
          onSelectSymbol={setSelectedSymbol}
          onConnectWallet={connectWallet}
          onDisconnectWallet={disconnectWallet}
        />

        {/* Chart & Trading Panel Container */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Chart Section */}
          <div className="flex-1 flex flex-col min-w-0 min-h-[400px] lg:min-h-0">
            {/* Chart Controls */}
            <div className={`${theme.bgSecondary} border-b ${theme.border} px-4 py-2.5 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-4">
                {/* Timeframes */}
                <div className="flex items-center gap-1">
                  {['5m', '1h', '4h', 'D'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${
                        timeframe === tf
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                          : `${theme.textSecondary} ${theme.hover} hover:text-white`
                      } interactive-hover`}
                    >
                      {tf}
                    </button>
                  ))}
                  <button className={`p-1.5 ${theme.textSecondary} hover:text-white transition-colors`}>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className={`hidden md:block w-px h-5 ${theme.borderSecondary}`}></div>

                <button className={`hidden md:block p-2 ${theme.hover} rounded-lg transition-all`} title="Chart Type">
                  <BarChart2 className={`w-4 h-4 ${theme.textSecondary}`} />
                </button>

                <button className={`hidden md:flex items-center gap-2 px-3 py-1.5 ${theme.hover} rounded-lg text-sm transition-all`}>
                  <span className="text-purple-500 font-mono font-bold">ƒₓ</span>
                  <span className={theme.textSecondary}>Indicators</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button className={`p-2 ${theme.hover} rounded-lg transition-all`}>
                  <Settings className={`w-4 h-4 ${theme.textSecondary}`} />
                </button>
                <button className={`p-2 ${theme.hover} rounded-lg transition-all`}>
                  <Maximize2 className={`w-4 h-4 ${theme.textSecondary}`} />
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative overflow-hidden">
              <ChartSection
                data={candlestickData}
                darkMode={darkMode}
                currentPrice={currentPrice}
                symbol={selectedSymbol.replace('USDT', '/USD')}
              />
            </div>

            {/* Positions Table */}
            <PositionsTable
              darkMode={darkMode}
              positions={positions}
              positionTab={positionTab}
              onTabChange={setPositionTab}
              onClosePosition={handleClosePosition}
              onCloseAllPositions={handleCloseAllPositions}
            />
          </div>

          {/* Trading Panel */}
          <TradingPanel
            darkMode={darkMode}
            activeTab={activeTab}
            orderType={orderType}
            leverage={leverage}
            orderSize={orderSize}
            percentage={percentage}
            availableBalance={availableBalance}
            currentPrice={currentPrice}
            orderLoading={orderLoading}
            canClaim={canClaim}
            faucetLoading={faucetLoading}
            cooldownSeconds={cooldownSeconds}
            onTabChange={setActiveTab}
            onOrderTypeChange={setOrderType}
            onLeverageChange={setLeverage}
            onOrderSizeChange={(value) => {
              setOrderSize(value);
              // Update percentage based on manual input
              if (availableBalance > 0 && value) {
                const size = parseFloat(value);
                const pct = Math.min(100, (size / leverage / availableBalance) * 100);
                setPercentage(Math.round(pct));
              }
            }}
            onPercentageChange={setPercentage}
            onOpenPosition={handleOpenPosition}
            onFaucetClaim={handleFaucetClaim}
          />
        </div>
      </div>
    </div>
  );
}
