"use client";

import React from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { SiBitcoin, SiEthereum } from 'react-icons/si';

interface HeaderStatsProps {
  darkMode: boolean;
  selectedSymbol: string;
  leverage: number;
  currentPrice: number;
  wallet: any;
  tonAddress: string;
  portfolio: any;
  onSelectSymbol: (symbol: string) => void;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export function HeaderStats({
  darkMode,
  selectedSymbol,
  leverage,
  currentPrice,
  wallet,
  tonAddress,
  portfolio,
  onSelectSymbol,
  onConnectWallet,
  onDisconnectWallet,
}: HeaderStatsProps) {
  const theme = darkMode ? {
    bgSecondary: 'bg-[#14151b]',
    bgTertiary: 'bg-[#1a1c24]',
    border: 'border-[#1e1f26]',
    borderSecondary: 'border-[#25262e]',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-[#1f212a]',
  } : {
    bgSecondary: 'bg-gray-50',
    bgTertiary: 'bg-gray-100',
    border: 'border-gray-200',
    borderSecondary: 'border-gray-300',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-gray-200',
  };

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

  return (
    <header className={`${theme.bgSecondary} border-b ${theme.border} px-4 md:px-6 py-3 shrink-0 animate-fade-in`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
          {/* Symbol Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <button className={`flex items-center gap-2 ${theme.bgTertiary} ${theme.hover} px-3 py-2 rounded-lg border ${theme.borderSecondary} transition-all interactive-hover`}>
              <div className={getSymbolDisplay().color}>
                {getSymbolDisplay().icon}
              </div>
              <span className="font-semibold text-sm">{getSymbolDisplay().name}</span>
              <span className={`text-[10px] ${theme.bgTertiary} ${theme.textSecondary} px-2 py-0.5 rounded border ${theme.borderSecondary}`}>{leverage}x</span>
            </button>

            {/* Symbol Options */}
            <div className="flex gap-1">
              {['ETHUSDT', 'BTCUSDT', 'TONUSDT'].map((symbol) => {
                const symbolInfo = {
                  'ETHUSDT': { icon: <SiEthereum className="w-3.5 h-3.5" />, label: 'ETH', color: 'text-[#627EEA]' },
                  'BTCUSDT': { icon: <SiBitcoin className="w-3.5 h-3.5" />, label: 'BTC', color: 'text-[#F7931A]' },
                  'TONUSDT': {
                    icon: (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
                    onClick={() => onSelectSymbol(symbol)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                      selectedSymbol === symbol
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : `${theme.bgTertiary} ${theme.textSecondary} ${theme.hover}`
                    } interactive-hover`}
                  >
                    <span className={selectedSymbol === symbol ? 'text-white' : symbolInfo.color}>
                      {symbolInfo.icon}
                    </span>
                    <span className="font-medium">{symbolInfo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Stats - Hide on small screens */}
          <div className="hidden lg:flex items-center gap-6">
            <Stat label="Price" value={currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : '-'} darkMode={darkMode} />
            <Stat
              label="Balance"
              value={`$${(portfolio?.wallet?.balance || 0).toFixed(2)}`}
              valueClass="text-blue-500 font-semibold"
              darkMode={darkMode}
            />
            <Stat
              label="Equity"
              value={`$${(portfolio?.wallet?.equity || 0).toFixed(2)}`}
              valueClass="text-emerald-500 font-semibold"
              darkMode={darkMode}
            />
            <Stat
              label="Total PnL"
              value={
                <span className={portfolio?.stats?.totalUnrealizedPnl >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                  {portfolio?.stats?.totalUnrealizedPnl >= 0 ? '+' : ''}${(portfolio?.stats?.totalUnrealizedPnl || 0).toFixed(2)}
                </span>
              }
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          {!wallet ? (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-600/30 font-medium text-sm text-white interactive-hover"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect TON</span>
            </button>
          ) : (
            <>
              <button className={`hidden sm:flex items-center gap-2 ${theme.bgTertiary} ${theme.hover} px-3 py-2 rounded-lg border ${theme.borderSecondary} transition-all`}>
                <span className="text-sm font-semibold">${(portfolio?.wallet?.available || 0).toFixed(2)}</span>
                <span className={`text-xs ${theme.textTertiary}`}>Available</span>
              </button>
              <button
                onClick={onDisconnectWallet}
                className={`flex items-center gap-2 ${theme.bgTertiary} ${theme.hover} px-3 py-2 rounded-lg border ${theme.borderSecondary} transition-all`}
              >
                <span className={`text-sm ${theme.textSecondary} font-mono`}>{tonAddress?.slice(0, 6)}...{tonAddress?.slice(-4)}</span>
                <ChevronDown className={`w-4 h-4 ${theme.textTertiary}`} />
              </button>
            </>
          )}
          <div className="hidden sm:block w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-full cursor-pointer interactive-hover"></div>
        </div>
      </div>
    </header>
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
    <div className="flex flex-col">
      <div className={`text-[10px] ${labelClass} mb-1 uppercase tracking-wide font-medium`}>{label}</div>
      <div className={`text-sm font-medium ${valueClass || textClass}`}>{value}</div>
    </div>
  );
}
