"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Layers, Target, MoreHorizontal, Settings, ChevronDown,
  Info, Plus, Maximize2, Activity, BarChart2, Moon, Sun, Wallet
} from 'lucide-react';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import { useAuth } from '@/providers/auth-provider';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useToast } from '@/providers/toast-provider';
import { tradingService, Position, PriceData } from '@/services/trading.service';
import { portfolioService } from '@/services/portfolio.service';
import { walletService } from '@/services/wallet.service';
import { faucetService } from '@/services/faucet.service';

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

  // Backend Data
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Leverage state
  const [leverage, setLeverage] = useState(50);

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
          fetchFaucetInfo(); // Refresh when cooldown ends
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

  // Generate candlestick data (placeholder - will be replaced with real data)
  const generateCandlesticks = () => {
    const data = [];
    const currentPrice = prices[selectedSymbol]?.price || 3500;
    let basePrice = currentPrice * 0.95;

    for (let i = 0; i < 120; i++) {
      const open = basePrice + (Math.random() - 0.5) * 150;
      const close = open + (Math.random() - 0.5) * 120;
      const high = Math.max(open, close) + Math.random() * 60;
      const low = Math.min(open, close) - Math.random() * 60;
      data.push({ open, high, low, close });
      basePrice = close;
    }
    return data;
  };

  const candlesticks = generateCandlesticks();

  // Improved Theme colors with better contrast and modern palette
  const theme = darkMode ? {
    bg: 'bg-gradient-to-br from-[#0a0b0f] via-[#0d0e13] to-[#0a0b0f]',
    bgSecondary: 'bg-[#13141a]/80 backdrop-blur-xl',
    bgTertiary: 'bg-[#1a1b23]/60',
    bgCard: 'bg-gradient-to-br from-[#16171e]/90 to-[#1a1b23]/80',
    border: 'border-[#1f2029]/80',
    borderSecondary: 'border-[#2a2b36]/60',
    borderGlow: 'border-purple-500/20',
    text: 'text-gray-50',
    textSecondary: 'text-gray-400',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-[#1f212a]/80 hover:border-purple-500/30',
    glow: 'shadow-lg shadow-purple-500/5',
    glowHover: 'hover:shadow-xl hover:shadow-purple-500/10',
  } : {
    bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
    bgSecondary: 'bg-white/80 backdrop-blur-xl',
    bgTertiary: 'bg-gray-50/60',
    bgCard: 'bg-gradient-to-br from-white/90 to-gray-50/80',
    border: 'border-gray-200/80',
    borderSecondary: 'border-gray-300/60',
    borderGlow: 'border-purple-300/40',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-gray-100/80 hover:border-purple-300/50',
    glow: 'shadow-md shadow-purple-100/20',
    glowHover: 'hover:shadow-lg hover:shadow-purple-100/30',
  };

  // Get current symbol display info with icon
  const getSymbolDisplay = () => {
    const symbolMap: Record<string, { name: string, icon: React.ReactNode, color: string }> = {
      'ETHUSDT': {
        name: 'ETH/USD',
        icon: <SiEthereum className="w-5 h-5" />,
        color: 'text-[#627EEA]'
      },
      'BTCUSDT': {
        name: 'BTC/USD',
        icon: <SiBitcoin className="w-5 h-5" />,
        color: 'text-[#F7931A]'
      },
      'TONUSDT': {
        name: 'TON/USD',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0088CC"/>
            <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z" fill="white"/>
          </svg>
        ),
        color: 'text-[#0088CC]'
      },
    };
    return symbolMap[selectedSymbol] || symbolMap['ETHUSDT'];
  };

  const currentPrice = prices[selectedSymbol]?.price || 0;
  const availableBalance = portfolio?.wallet?.available || 0;
  const calculatedMargin = orderSize ? parseFloat(orderSize) / leverage : 0;
  const fee = orderSize ? parseFloat(orderSize) * 0.001 : 0;

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
    <div className={`h-screen ${theme.bg} ${theme.text} flex overflow-hidden font-sans`}>
      {/* Left Sidebar - Improved with premium gradient */}
      <aside className={`w-16 ${theme.bgSecondary} border-r ${theme.border} flex flex-col items-center py-4 relative`}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 via-transparent to-transparent pointer-events-none"></div>

        {/* Logo - More premium design */}
        <div className={`w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer mb-6 ${theme.glow} relative z-10`}>
          <span className="text-white font-bold text-xl drop-shadow-lg">P</span>
        </div>

        {/* Navigation Icons - Better spacing and styling */}
        <nav className="flex-1 flex flex-col space-y-3 relative z-10">
          <NavIcon icon={<TrendingUp className="w-5 h-5" />} active tooltip="Trade" darkMode={darkMode} />
          <NavIcon icon={<Layers className="w-5 h-5" />} tooltip="Pools" darkMode={darkMode} disabled />
          <NavIcon icon={<Target className="w-5 h-5" />} tooltip="Stake" darkMode={darkMode} disabled />
          <NavIcon icon={<MoreHorizontal className="w-5 h-5" />} tooltip="More" darkMode={darkMode} disabled />
        </nav>

        {/* Bottom Icons - Improved styling */}
        <div className="space-y-3 relative z-10">
          {/* Dark Mode Toggle - Better design */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-11 ${theme.bgTertiary} ${theme.hover} rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border ${theme.borderSecondary} ${theme.glowHover}`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-600" />}
          </button>
          <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center cursor-pointer hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-600/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <button
            onClick={logout}
            className={`w-11 h-11 ${theme.bgTertiary} rounded-lg flex items-center justify-center text-[10px] ${theme.textTertiary} cursor-pointer ${theme.hover} transition-all duration-300 border ${theme.borderSecondary}`}
            title="Logout"
          >
            ⎋
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar - Premium Design */}
        <header className={`${theme.bgSecondary} border-b ${theme.border} px-6 py-3 shrink-0 relative`}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/3 via-transparent to-blue-600/3 pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              {/* Symbol Selector - Improved card design */}
              <div className="flex items-center space-x-3">
                <button className={`flex items-center space-x-2.5 ${theme.bgCard} ${theme.hover} px-4 py-2 rounded-xl border ${theme.borderGlow} transition-all duration-300 ${theme.glowHover}`}>
                  <div className={getSymbolDisplay().color}>
                    {getSymbolDisplay().icon}
                  </div>
                  <span className="font-bold text-sm">{getSymbolDisplay().name}</span>
                  <span className={`text-[10px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/30`}>{leverage}x</span>
                </button>
                {/* Symbol Options - Better pill design */}
                <div className="flex gap-1.5">
                  {['ETHUSDT', 'BTCUSDT', 'TONUSDT'].map((symbol) => {
                    const symbolInfo = {
                      'ETHUSDT': { icon: <SiEthereum className="w-3 h-3" />, label: 'ETH', color: 'text-[#627EEA]' },
                      'BTCUSDT': { icon: <SiBitcoin className="w-3 h-3" />, label: 'BTC', color: 'text-[#F7931A]' },
                      'TONUSDT': {
                        icon: (
                          <svg className="w-3 h-3" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="currentColor" opacity="0.2"/>
                            <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z" fill="currentColor"/>
                          </svg>
                        ),
                        label: 'TON',
                        color: 'text-[#0088CC]'
                      },
                    }[symbol];

                    return (
                      <button
                        key={symbol}
                        onClick={() => setSelectedSymbol(symbol)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-300 font-medium ${
                          selectedSymbol === symbol
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 border border-purple-500/50'
                            : `${theme.bgTertiary} ${theme.textSecondary} ${theme.hover} border ${theme.borderSecondary}`
                        }`}
                      >
                        <span className={selectedSymbol === symbol ? 'text-white' : symbolInfo.color}>
                          {symbolInfo.icon}
                        </span>
                        <span>{symbolInfo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Market Stats - Improved card design */}
              <div className="flex items-center gap-6">
                <div className={`px-4 py-2 ${theme.bgCard} rounded-lg border ${theme.borderGlow} ${theme.glow}`}>
                  <Stat label="Last price" value={currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : '-'} valueClass="text-green-400" darkMode={darkMode} />
                </div>
                <div className={`px-4 py-2 ${theme.bgCard} rounded-lg border ${theme.borderGlow} ${theme.glow}`}>
                  <Stat
                    label="Balance"
                    value={`$${(portfolio?.wallet?.balance || 0).toFixed(2)}`}
                    valueClass="text-blue-400"
                    darkMode={darkMode}
                  />
                </div>
                <div className={`px-4 py-2 ${theme.bgCard} rounded-lg border ${theme.borderGlow} ${theme.glow}`}>
                  <Stat
                    label="Equity"
                    value={`$${(portfolio?.wallet?.equity || 0).toFixed(2)}`}
                    valueClass="text-cyan-400"
                    darkMode={darkMode}
                  />
                </div>
                <div className={`px-4 py-2 ${theme.bgCard} rounded-lg border ${theme.borderGlow} ${theme.glow}`}>
                  <Stat
                    label="Total PnL"
                    value={
                      <span className={portfolio?.stats?.totalUnrealizedPnl >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {portfolio?.stats?.totalUnrealizedPnl >= 0 ? '+' : ''}${(portfolio?.stats?.totalUnrealizedPnl || 0).toFixed(2)}
                      </span>
                    }
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Premium wallet UI */}
            <div className="flex items-center gap-3">
              {/* Connect Wallet Button - More attractive */}
              {!wallet ? (
                <button
                  onClick={connectWallet}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-600/40 hover:shadow-xl hover:shadow-purple-600/50 font-bold text-sm text-white relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  <Wallet className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Connect TON</span>
                </button>
              ) : (
                <>
                  <div className={`flex items-center gap-2.5 ${theme.bgCard} px-4 py-2 rounded-xl border ${theme.borderGlow} ${theme.glow}`}>
                    <span className="text-sm font-bold text-green-400">${(portfolio?.wallet?.available || 0).toFixed(2)}</span>
                    <span className={`text-xs ${theme.textTertiary}`}>Available</span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className={`flex items-center gap-2 ${theme.bgCard} ${theme.hover} px-4 py-2 rounded-xl border ${theme.borderGlow} transition-all duration-300 ${theme.glowHover}`}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm font-medium ${theme.text}`}>{tonAddress?.slice(0, 6)}...{tonAddress?.slice(-4)}</span>
                    <ChevronDown className={`w-4 h-4 ${theme.textTertiary}`} />
                  </button>
                </>
              )}
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-full cursor-pointer shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all duration-300 hover:scale-110"></div>
            </div>
          </div>
        </header>

        {/* Chart & Trading Panel Container */}
        <div className="flex-1 flex min-h-0">
          {/* Chart Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chart Controls */}
            <div className={`${theme.bgSecondary} border-b ${theme.border} px-4 py-2 flex items-center justify-between shrink-0`}>
              <div className="flex items-center space-x-4">
                {/* Timeframes */}
                <div className="flex items-center space-x-1">
                  {['5m', '1h', 'D'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        timeframe === tf
                          ? 'bg-purple-600 text-white'
                          : `${theme.textSecondary} hover:text-white ${theme.hover}`
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                  <button className={`p-1 ${theme.textSecondary} hover:text-white`}>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className={`w-px h-5 ${theme.borderSecondary}`}></div>

                <button className={`p-1.5 ${theme.hover} rounded transition-colors`} title="Chart Type">
                  <BarChart2 className={`w-4 h-4 ${theme.textSecondary}`} />
                </button>

                <button className={`flex items-center space-x-1.5 px-2.5 py-1.5 ${theme.hover} rounded text-sm transition-colors`}>
                  <span className="text-purple-500 font-mono">ƒₓ</span>
                  <span className={theme.textSecondary}>Indicators</span>
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button className={`p-1.5 ${theme.hover} rounded transition-colors`}>
                  <Settings className={`w-4 h-4 ${theme.textSecondary}`} />
                </button>
                <button className={`p-1.5 ${theme.hover} rounded transition-colors`}>
                  <Maximize2 className={`w-4 h-4 ${theme.textSecondary}`} />
                </button>
              </div>
            </div>

            {/* Price Ticker */}
            <div className={`${theme.bgSecondary} border-b ${theme.border} px-4 py-2 shrink-0`}>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${theme.text}`}>{getSymbolDisplay().name}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                {currentPrice > 0 && (
                  <>
                    <span className="text-green-500">Price <span className={theme.text}>${currentPrice.toLocaleString()}</span></span>
                    <span className={theme.textTertiary}>Updated: {new Date(prices[selectedSymbol]?.timestamp || Date.now()).toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Chart Area */}
            <div className={`flex-1 ${theme.bg} relative overflow-hidden`}>
              <CandlestickChart data={candlesticks} darkMode={darkMode} currentPrice={currentPrice} />
            </div>

            {/* Positions Table */}
            <div className={`${theme.bgSecondary} border-t ${theme.border} shrink-0`}>
              {/* Tabs */}
              <div className={`flex border-b ${theme.border}`}>
                {['Positions', 'Orders', 'History'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPositionTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                      positionTab === tab
                        ? theme.text
                        : `${theme.textTertiary} hover:${theme.textSecondary}`
                    }`}
                  >
                    {tab}
                    {tab === 'Positions' && positions.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-purple-600 text-white rounded-full">{positions.length}</span>
                    )}
                    {positionTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="h-48 overflow-auto">
                {positionTab === 'Positions' && (
                  <table className="w-full text-xs">
                    <thead className={`sticky top-0 ${theme.bgSecondary} ${theme.textTertiary} border-b ${theme.border}`}>
                      <tr>
                        <th className="text-left px-6 py-3 font-normal">Market</th>
                        <th className="text-left px-6 py-3 font-normal">Side</th>
                        <th className="text-left px-6 py-3 font-normal">Leverage</th>
                        <th className="text-left px-6 py-3 font-normal">Entry price</th>
                        <th className="text-left px-6 py-3 font-normal">Mark price</th>
                        <th className="text-left px-6 py-3 font-normal">Size</th>
                        <th className="text-left px-6 py-3 font-normal">Margin</th>
                        <th className="text-left px-6 py-3 font-normal">PnL</th>
                        <th className="text-left px-6 py-3 font-normal">ROE</th>
                        <th className="text-left px-6 py-3 font-normal">Liq. price</th>
                        <th className="text-right px-6 py-3 font-normal">
                          {positions.length > 0 && (
                            <button
                              onClick={handleCloseAllPositions}
                              className="text-red-500 hover:text-red-400 flex items-center ml-auto space-x-2"
                            >
                              <span>Close all</span>
                            </button>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={theme.text}>
                      {positions.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center py-16">
                            <div className="flex flex-col items-center space-y-3">
                              <div className={`w-14 h-14 ${theme.bgTertiary} rounded-full flex items-center justify-center`}>
                                <svg className={`w-7 h-7 ${theme.textTertiary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                              <div className={`${theme.text} font-medium`}>No active position</div>
                              <div className={`${theme.textTertiary} text-xs`}>Open a new position to see it here.</div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        positions.map((position) => (
                          <tr key={position.id} className={`border-b ${theme.border} ${theme.hover}`}>
                            <td className="px-6 py-3 font-medium">{position.symbol.replace('USDT', '/USD')}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                position.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {position.side === 'BUY' ? 'LONG' : 'SHORT'}
                              </span>
                            </td>
                            <td className="px-6 py-3">{position.leverage}x</td>
                            <td className="px-6 py-3">${position.entryPrice.toFixed(2)}</td>
                            <td className="px-6 py-3">${position.markPrice.toFixed(2)}</td>
                            <td className="px-6 py-3">${position.size.toFixed(2)}</td>
                            <td className="px-6 py-3">${position.margin.toFixed(2)}</td>
                            <td className={`px-6 py-3 font-semibold ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                            </td>
                            <td className={`px-6 py-3 font-semibold ${position.roe >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {position.roe >= 0 ? '+' : ''}{position.roe.toFixed(2)}%
                            </td>
                            <td className="px-6 py-3 text-orange-400">${position.liquidationPrice.toFixed(2)}</td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => handleClosePosition(position.id)}
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
                {positionTab === 'Orders' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className={`${theme.textTertiary} text-sm`}>No open orders</div>
                    </div>
                  </div>
                )}
                {positionTab === 'History' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className={`${theme.textTertiary} text-sm`}>No position history</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trading Panel - Modern card-based design */}
          <aside className={`w-96 ${theme.bgSecondary} border-l ${theme.border} flex flex-col shrink-0 relative`}>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600/3 via-transparent to-transparent pointer-events-none"></div>

            {/* Market/Limit Tabs - Better design */}
            <div className={`flex border-b ${theme.border} shrink-0 relative z-10 ${theme.bgCard}`}>
              {['Market', 'Limit'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all duration-300 relative ${
                    activeTab === tab
                      ? `${theme.text}`
                      : `${theme.textTertiary} hover:${theme.textSecondary}`
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-purple-600/10 to-transparent -z-10"></div>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Trading Form - Better spacing and card design */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10">
              {/* Long/Short + Leverage - Premium buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setOrderType('Long')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden group ${
                    orderType === 'Long'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30 border border-green-500/50'
                      : `${theme.bgCard} ${theme.textSecondary} ${theme.hover} hover:text-white border ${theme.borderSecondary}`
                  }`}
                >
                  {orderType === 'Long' && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>}
                  <span className="relative z-10">Long</span>
                </button>
                <button
                  onClick={() => setOrderType('Short')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden group ${
                    orderType === 'Short'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 border border-red-500/50'
                      : `${theme.bgCard} ${theme.textSecondary} ${theme.hover} hover:text-white border ${theme.borderSecondary}`
                  }`}
                >
                  {orderType === 'Short' && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>}
                  <span className="relative z-10">Short</span>
                </button>
                <div className="relative group">
                  <button className={`px-5 py-3 ${theme.bgCard} ${theme.hover} rounded-xl font-bold text-sm transition-all duration-300 border ${theme.borderGlow} ${theme.glowHover}`}>
                    {leverage}x
                  </button>
                  {/* Leverage selector dropdown */}
                  <div className={`absolute hidden group-hover:block top-full right-0 mt-1 ${theme.bgSecondary} border ${theme.border} rounded-lg shadow-xl p-2 z-10 min-w-[120px]`}>
                    {[5, 10, 20, 50, 100].map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setLeverage(lev)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded ${theme.hover} ${leverage === lev ? 'bg-purple-600 text-white' : theme.text}`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available Balance - Better card */}
              <div className={`flex items-center justify-between text-sm ${theme.bgCard} px-4 py-3 rounded-xl border ${theme.borderGlow} ${theme.glow}`}>
                <span className={theme.textSecondary}>Available to trade</span>
                <span className="font-bold text-blue-400">${availableBalance.toFixed(2)}</span>
              </div>

              {/* Testnet Faucet Button - More attractive */}
              <button
                onClick={handleFaucetClaim}
                disabled={!canClaim || faucetLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 border relative overflow-hidden group ${
                  canClaim && !faucetLoading
                    ? `${theme.bgCard} border-green-500/50 ${theme.textSecondary} hover:bg-green-500/20 hover:text-green-400 hover:border-green-500 shadow-lg shadow-green-500/10`
                    : `${theme.bgCard} ${theme.borderSecondary} ${theme.textTertiary} cursor-not-allowed opacity-50`
                }`}
              >
                {faucetLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-gray-400"></div>
                    <span>Claiming...</span>
                  </span>
                ) : cooldownSeconds > 0 ? (
                  <span>Faucet: {Math.floor(cooldownSeconds / 3600)}h {Math.floor((cooldownSeconds % 3600) / 60)}m</span>
                ) : canClaim ? (
                  <span className="flex items-center justify-center gap-2">
                    💰 <span>Claim $1000 USDT Testnet</span>
                  </span>
                ) : (
                  <span>Faucet: Check back later</span>
                )}
              </button>

              {/* Order Size - Better input design */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-semibold ${theme.textSecondary}`}>Enter size</label>
                  <select className={`${theme.bgCard} border ${theme.borderGlow} px-3 py-1.5 rounded-lg text-xs ${theme.text} font-bold focus:outline-none focus:border-purple-600 cursor-pointer transition-all duration-300`}>
                    <option>USD</option>
                    <option>MON</option>
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={orderSize}
                    onChange={(e) => {
                      setOrderSize(e.target.value);
                      // Update percentage based on manual input
                      if (availableBalance > 0 && e.target.value) {
                        const size = parseFloat(e.target.value);
                        const pct = Math.min(100, (size / leverage / availableBalance) * 100);
                        setPercentage(Math.round(pct));
                      }
                    }}
                    placeholder="0.00"
                    className={`w-full ${theme.bgCard} border ${theme.borderGlow} rounded-xl px-5 py-4 ${theme.text} text-lg font-bold ${darkMode ? 'placeholder-gray-700' : 'placeholder-gray-400'} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                    USD
                  </div>
                </div>
              </div>

              {/* Percentage Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-600 mb-2 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className={`w-full h-1 ${darkMode ? 'bg-[#25262e]' : 'bg-gray-300'} rounded-full appearance-none cursor-pointer slider`}
                    style={{
                      background: `linear-gradient(to right, #9333ea ${percentage}%, ${darkMode ? '#25262e' : '#d1d5db'} ${percentage}%)`
                    }}
                  />
                </div>
              </div>

              {/* Order Options */}
              <div className="space-y-2.5">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className={`w-4 h-4 appearance-none ${theme.bgTertiary} border ${theme.borderSecondary} rounded checked:bg-purple-600 checked:border-purple-600 cursor-pointer`} />
                  </div>
                  <span className={`text-sm ${theme.textSecondary} group-hover:${theme.text} transition-colors`}>Reduce Only</span>
                  <Info className={`w-3.5 h-3.5 ${theme.textTertiary} group-hover:text-gray-500 transition-colors`} />
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className={`w-4 h-4 appearance-none ${theme.bgTertiary} border ${theme.borderSecondary} rounded checked:bg-purple-600 checked:border-purple-600 cursor-pointer`} />
                  </div>
                  <span className={`text-sm ${theme.textSecondary} group-hover:${theme.text} transition-colors`}>Protected Order</span>
                  <Info className={`w-3.5 h-3.5 ${theme.textTertiary} group-hover:text-gray-500 transition-colors`} />
                </label>
              </div>

              {/* Add TP/SL */}
              <button className={`w-full flex items-center justify-center space-x-2 py-3 ${theme.bgTertiary} ${theme.hover} rounded-lg text-sm ${theme.textSecondary} hover:text-white transition-colors border ${theme.borderSecondary}`}>
                <Plus className="w-4 h-4" />
                <span>Add Take Profit / Stop Loss</span>
              </button>

              {/* Buy/Sell Button - Premium design with glow effect */}
              <button
                onClick={handleOpenPosition}
                disabled={orderLoading || !orderSize || parseFloat(orderSize) <= 0}
                className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-300 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group ${
                  orderType === 'Long'
                    ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-500 hover:via-emerald-500 hover:to-green-500 shadow-green-600/40 hover:shadow-green-600/60 border border-green-500/50'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 shadow-red-600/40 hover:shadow-red-600/60 border border-red-500/50'
                }`}
              >
                {!orderLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {orderLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Opening Position...</span>
                    </>
                  ) : (
                    <>
                      <span>{orderType === 'Long' ? 'Buy / Long' : 'Sell / Short'}</span>
                      {orderSize && parseFloat(orderSize) > 0 && (
                        <span className="text-white/90 font-normal">({leverage}x)</span>
                      )}
                    </>
                  )}
                </span>
              </button>

              {/* Order Details */}
              <div className={`space-y-2.5 text-sm pt-3 border-t ${theme.border}`}>
                <DetailRow
                  label="Margin"
                  value={orderSize ? `$${calculatedMargin.toFixed(2)}` : '-'}
                  darkMode={darkMode}
                />
                <DetailRow
                  label="Fee (0.1%)"
                  value={orderSize ? `$${fee.toFixed(2)}` : '-'}
                  info
                  darkMode={darkMode}
                />
                <DetailRow
                  label="Liq. Price"
                  value={orderSize && currentPrice > 0
                    ? `$${(orderType === 'Long'
                      ? currentPrice * (1 - 0.9 / leverage)
                      : currentPrice * (1 + 0.9 / leverage)
                    ).toFixed(2)}`
                    : '-'
                  }
                  darkMode={darkMode}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface NavIconProps {
  icon: React.ReactNode;
  active?: boolean;
  tooltip?: string;
  darkMode?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function NavIcon({ icon, active, tooltip, darkMode, disabled, onClick }: NavIconProps) {
  return (
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all relative group ${
        active
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
          : disabled
          ? darkMode ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
          : darkMode
          ? 'text-gray-500 hover:bg-[#1a1c24] hover:text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
      title={tooltip}
      onClick={!disabled ? onClick : undefined}
    >
      {icon}
      {/* Tooltip */}
      {tooltip && (
        <div className={`absolute left-full ml-2 px-2 py-1 ${darkMode ? 'bg-slate-800' : 'bg-gray-900'} text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50`}>
          {tooltip}
          {disabled && <span className="text-slate-500 ml-1">(Soon)</span>}
        </div>
      )}
    </div>
  );
}

interface StatProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  darkMode?: boolean;
}

function Stat({ label, value, valueClass = '', darkMode }: StatProps) {
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const labelClass = darkMode ? 'text-gray-500' : 'text-gray-600';

  return (
    <div>
      <div className={`text-[10px] ${labelClass} mb-0.5`}>{label}</div>
      <div className={`text-xs font-medium ${valueClass || textClass}`}>{value}</div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  info?: boolean;
  darkMode?: boolean;
}

function DetailRow({ label, value, info, darkMode }: DetailRowProps) {
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const labelClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const iconClass = darkMode ? 'text-gray-600' : 'text-gray-500';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-1.5">
        <span className={labelClass}>{label}</span>
        {info && <Info className={`w-3 h-3 ${iconClass}`} />}
      </div>
      <span className={textClass}>{value}</span>
    </div>
  );
}

interface CandlestickChartProps {
  data: Array<{ open: number; high: number; low: number; close: number }>;
  darkMode: boolean;
  currentPrice: number;
}

function CandlestickChart({ data, darkMode, currentPrice }: CandlestickChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (chartRef.current) {
      const updateDimensions = () => {
        setDimensions({
          width: chartRef.current!.clientWidth,
          height: chartRef.current!.clientHeight
        });
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const { width, height } = dimensions;
  const padding = { top: 20, right: 80, bottom: 40, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate price range
  const allPrices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices) * 0.998;
  const maxPrice = Math.max(...allPrices) * 1.002;
  const priceRange = maxPrice - minPrice;

  const candleWidth = 5;
  const candleSpacing = Math.max(7, chartWidth / data.length);

  // Generate grid lines
  const gridLines = 8;
  const priceStep = priceRange / (gridLines - 1);

  // Time labels
  const timeLabels = ['Jun', '15', 'Jul', '15', 'Aug', '15', 'Sep', '15', 'Oct', '15', 'Nov'];

  return (
    <div ref={chartRef} className="w-full h-full relative">
      {width > 0 && height > 0 && (
        <svg width={width} height={height} className="absolute inset-0">
          {/* Grid Lines */}
          <g>
            {Array.from({ length: gridLines }).map((_, i) => {
              const y = padding.top + (chartHeight / (gridLines - 1)) * i;
              const price = maxPrice - priceStep * i;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke={darkMode ? '#1e1f26' : '#e5e7eb'}
                    strokeWidth="1"
                  />
                  <text
                    x={width - padding.right + 10}
                    y={y + 4}
                    fill={darkMode ? '#6b7280' : '#9ca3af'}
                    fontSize="10"
                    fontFamily="system-ui"
                  >
                    {price.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Dotted horizontal line */}
          <line
            x1={padding.left}
            y1={height / 2}
            x2={width - padding.right}
            y2={height / 2}
            stroke={darkMode ? '#2a2c36' : '#d1d5db'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Candlesticks */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {data.map((candle, i) => {
              const x = i * candleSpacing;
              const bodyTop = Math.min(candle.open, candle.close);
              const bodyBottom = Math.max(candle.open, candle.close);
              const bodyHeight = bodyBottom - bodyTop;

              const yHigh = ((maxPrice - candle.high) / priceRange) * chartHeight;
              const yLow = ((maxPrice - candle.low) / priceRange) * chartHeight;
              const yBodyTop = ((maxPrice - bodyTop) / priceRange) * chartHeight;
              const yBodyHeight = (bodyHeight / priceRange) * chartHeight;

              const isGreen = candle.close > candle.open;
              const color = isGreen ? '#10b981' : '#ef4444';

              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={yBodyTop}
                    width={candleWidth}
                    height={Math.max(yBodyHeight, 1)}
                    fill={color}
                  />
                </g>
              );
            })}
          </g>

          {/* Time Labels */}
          <g transform={`translate(${padding.left}, ${height - padding.bottom + 20})`}>
            {timeLabels.map((label, i) => (
              <text
                key={i}
                x={(chartWidth / (timeLabels.length - 1)) * i}
                y={0}
                fill={darkMode ? '#6b7280' : '#9ca3af'}
                fontSize="10"
                fontFamily="system-ui"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </g>

          {/* Current Price Label */}
          {currentPrice > 0 && (
            <>
              <g transform={`translate(${width - padding.right}, ${height / 2})`}>
                <rect
                  x={0}
                  y={-12}
                  width={65}
                  height={24}
                  fill="#10b981"
                  rx={4}
                />
                <text
                  x={32.5}
                  y={4}
                  fill="white"
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {currentPrice.toFixed(2)}
                </text>
              </g>

              {/* Price line indicator */}
              <line
                x1={width - padding.right - 15}
                y1={height / 2}
                x2={width - padding.right}
                y2={height / 2}
                stroke="#10b981"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
      )}
    </div>
  );
}
