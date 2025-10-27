"use client";

import React from 'react';
import { Info, Plus } from 'lucide-react';

interface TradingPanelProps {
  darkMode: boolean;
  activeTab: string;
  orderType: 'Long' | 'Short';
  leverage: number;
  orderSize: string;
  percentage: number;
  availableBalance: number;
  currentPrice: number;
  orderLoading: boolean;
  canClaim: boolean;
  faucetLoading: boolean;
  cooldownSeconds: number;
  onTabChange: (tab: string) => void;
  onOrderTypeChange: (type: 'Long' | 'Short') => void;
  onLeverageChange: (leverage: number) => void;
  onOrderSizeChange: (size: string) => void;
  onPercentageChange: (percentage: number) => void;
  onOpenPosition: () => void;
  onFaucetClaim: () => void;
}

export function TradingPanel({
  darkMode,
  activeTab,
  orderType,
  leverage,
  orderSize,
  percentage,
  availableBalance,
  currentPrice,
  orderLoading,
  canClaim,
  faucetLoading,
  cooldownSeconds,
  onTabChange,
  onOrderTypeChange,
  onLeverageChange,
  onOrderSizeChange,
  onPercentageChange,
  onOpenPosition,
  onFaucetClaim,
}: TradingPanelProps) {
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

  const calculatedMargin = orderSize ? parseFloat(orderSize) / leverage : 0;
  const fee = orderSize ? parseFloat(orderSize) * 0.001 : 0;
  const liquidationPrice = orderSize && currentPrice > 0
    ? (orderType === 'Long'
      ? currentPrice * (1 - 0.9 / leverage)
      : currentPrice * (1 + 0.9 / leverage))
    : 0;

  return (
    <aside className={`w-full lg:w-96 ${theme.bgSecondary} border-t lg:border-t-0 lg:border-l ${theme.border} flex flex-col shrink-0 animate-slide-in-bottom lg:animate-slide-in-right`}>
      {/* Market/Limit Tabs */}
      <div className={`flex border-b ${theme.border} shrink-0`}>
        {['Market', 'Limit'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? theme.text
                : `${theme.textTertiary} hover:${theme.textSecondary}`
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* Trading Form */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Long/Short + Leverage */}
        <div className="flex gap-2">
          <button
            onClick={() => onOrderTypeChange('Long')}
            className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
              orderType === 'Long'
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                : `${theme.bgTertiary} ${theme.textSecondary} ${theme.hover} hover:text-white`
            } interactive-hover`}
          >
            Long
          </button>
          <button
            onClick={() => onOrderTypeChange('Short')}
            className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
              orderType === 'Short'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : `${theme.bgTertiary} ${theme.textSecondary} ${theme.hover} hover:text-white`
            } interactive-hover`}
          >
            Short
          </button>
          <div className="relative group">
            <button className={`px-5 py-3 ${theme.bgTertiary} ${theme.hover} rounded-lg font-semibold text-sm transition-all border ${theme.borderSecondary} interactive-hover`}>
              {leverage}x
            </button>
            {/* Leverage selector dropdown */}
            <div className={`absolute hidden group-hover:block top-full right-0 mt-2 ${theme.bgSecondary} border ${theme.border} rounded-lg shadow-2xl p-2 z-10 min-w-[140px] animate-fade-in-scale`}>
              <div className="text-xs text-gray-500 px-3 py-1 mb-1 font-medium uppercase">Leverage</div>
              {[5, 10, 20, 50, 100].map((lev) => (
                <button
                  key={lev}
                  onClick={() => onLeverageChange(lev)}
                  className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${leverage === lev ? 'bg-purple-600 text-white font-semibold' : `${theme.text} ${theme.hover}`} interactive-hover`}
                >
                  {lev}x Leverage
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="flex items-center justify-between text-sm">
          <span className={theme.textSecondary}>Available to trade</span>
          <span className="font-semibold text-base">${availableBalance.toFixed(2)} <span className={theme.textTertiary}>USD</span></span>
        </div>

        {/* Testnet Faucet Button */}
        <button
          onClick={onFaucetClaim}
          disabled={!canClaim || faucetLoading}
          className={`w-full py-3 rounded-lg font-medium text-sm transition-all border ${
            canClaim && !faucetLoading
              ? `${theme.bgTertiary} border-green-500/50 ${theme.textSecondary} hover:bg-green-500/20 hover:text-green-400 hover:border-green-500 shadow-lg shadow-green-500/10`
              : `${theme.bgTertiary} ${theme.borderSecondary} ${theme.textTertiary} cursor-not-allowed opacity-60`
          } interactive-hover`}
        >
          {faucetLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-gray-400"></div>
              <span>Claiming...</span>
            </span>
          ) : cooldownSeconds > 0 ? (
            <span>Faucet cooldown: {Math.floor(cooldownSeconds / 3600)}h {Math.floor((cooldownSeconds % 3600) / 60)}m</span>
          ) : canClaim ? (
            <span className="flex items-center justify-center gap-2">
              💰 <span>Claim $1000 USDT (Testnet)</span>
            </span>
          ) : (
            <span>Faucet: Check back later</span>
          )}
        </button>

        {/* Order Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${theme.textSecondary}`}>Order Size</label>
            <select className={`${theme.bgTertiary} border ${theme.borderSecondary} px-3 py-1.5 rounded-lg text-sm ${theme.text} focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer transition-all`}>
              <option>USD</option>
              <option>Contracts</option>
            </select>
          </div>
          <input
            type="number"
            value={orderSize}
            onChange={(e) => onOrderSizeChange(e.target.value)}
            placeholder="0.00"
            className={`w-full ${theme.bgTertiary} border ${theme.borderSecondary} rounded-lg px-4 py-3.5 ${theme.text} ${darkMode ? 'placeholder-gray-600' : 'placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all text-lg font-semibold`}
          />
        </div>

        {/* Percentage Slider */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-3 px-1 font-medium">
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
              onChange={(e) => onPercentageChange(Number(e.target.value))}
              className={`w-full h-2 ${darkMode ? 'bg-[#25262e]' : 'bg-gray-300'} rounded-full appearance-none cursor-pointer slider`}
              style={{
                background: `linear-gradient(to right, #9333ea ${percentage}%, ${darkMode ? '#25262e' : '#d1d5db'} ${percentage}%)`
              }}
            />
          </div>
          <div className="text-center mt-2">
            <span className={`text-sm font-semibold ${theme.text}`}>{percentage}%</span>
            <span className={`text-xs ${theme.textTertiary} ml-1`}>of available balance</span>
          </div>
        </div>

        {/* Order Options */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className={`w-4 h-4 appearance-none ${theme.bgTertiary} border ${theme.borderSecondary} rounded checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all`} />
            </div>
            <span className={`text-sm ${theme.textSecondary} group-hover:${theme.text} transition-colors`}>Reduce Only</span>
            <Info className={`w-4 h-4 ${theme.textTertiary} group-hover:text-gray-500 transition-colors`} />
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className={`w-4 h-4 appearance-none ${theme.bgTertiary} border ${theme.borderSecondary} rounded checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all`} />
            </div>
            <span className={`text-sm ${theme.textSecondary} group-hover:${theme.text} transition-colors`}>Protected Order</span>
            <Info className={`w-4 h-4 ${theme.textTertiary} group-hover:text-gray-500 transition-colors`} />
          </label>
        </div>

        {/* Add TP/SL */}
        <button className={`w-full flex items-center justify-center space-x-2 py-3 ${theme.bgTertiary} ${theme.hover} rounded-lg text-sm ${theme.textSecondary} hover:text-white transition-all border ${theme.borderSecondary} interactive-hover`}>
          <Plus className="w-4 h-4" />
          <span>Add Take Profit / Stop Loss</span>
        </button>

        {/* Buy/Sell Button */}
        <button
          onClick={onOpenPosition}
          disabled={orderLoading || !orderSize || parseFloat(orderSize) <= 0}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base ${
            orderType === 'Long'
              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-600/40'
              : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-600/40'
          } interactive-hover`}
        >
          {orderLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Opening Position...</span>
            </span>
          ) : (
            orderType === 'Long' ? 'Buy / Long' : 'Sell / Short'
          )}
        </button>

        {/* Order Details */}
        <div className={`space-y-3 text-sm pt-4 border-t ${theme.border}`}>
          <DetailRow
            label="Required Margin"
            value={orderSize ? `$${calculatedMargin.toFixed(2)}` : '-'}
            darkMode={darkMode}
          />
          <DetailRow
            label="Trading Fee (0.1%)"
            value={orderSize ? `$${fee.toFixed(2)}` : '-'}
            info
            darkMode={darkMode}
          />
          <DetailRow
            label="Est. Liquidation Price"
            value={liquidationPrice > 0 ? `$${liquidationPrice.toFixed(2)}` : '-'}
            valueClass="text-orange-500 font-semibold"
            darkMode={darkMode}
          />
        </div>
      </div>
    </aside>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  info?: boolean;
  darkMode?: boolean;
  valueClass?: string;
}

function DetailRow({ label, value, info, darkMode, valueClass }: DetailRowProps) {
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const labelClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const iconClass = darkMode ? 'text-gray-600' : 'text-gray-500';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className={labelClass}>{label}</span>
        {info && <Info className={`w-3.5 h-3.5 ${iconClass}`} />}
      </div>
      <span className={valueClass || textClass}>{value}</span>
    </div>
  );
}
