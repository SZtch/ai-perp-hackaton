"use client";

import React from 'react';
import { Position } from '@/services/trading.service';

interface PositionsTableProps {
  darkMode: boolean;
  positions: Position[];
  positionTab: string;
  onTabChange: (tab: string) => void;
  onClosePosition: (positionId: string) => void;
  onCloseAllPositions: () => void;
}

export function PositionsTable({
  darkMode,
  positions,
  positionTab,
  onTabChange,
  onClosePosition,
  onCloseAllPositions,
}: PositionsTableProps) {
  const theme = darkMode ? {
    bgSecondary: 'bg-[#14151b]',
    bgTertiary: 'bg-[#1a1c24]',
    border: 'border-[#1e1f26]',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-[#1f212a]',
  } : {
    bgSecondary: 'bg-gray-50',
    bgTertiary: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
    hover: 'hover:bg-gray-200',
  };

  return (
    <div className={`${theme.bgSecondary} border-t ${theme.border} shrink-0 animate-fade-in`}>
      {/* Tabs */}
      <div className={`flex border-b ${theme.border} overflow-x-auto scrollbar-hide`}>
        {['Positions', 'Orders', 'History'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-3.5 text-sm font-semibold transition-all relative whitespace-nowrap ${
              positionTab === tab
                ? theme.text
                : `${theme.textTertiary} hover:${theme.textSecondary}`
            }`}
          >
            {tab}
            {tab === 'Positions' && positions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-purple-600 text-white rounded-full font-bold animate-pulse-glow">{positions.length}</span>
            )}
            {positionTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="h-64 lg:h-48 overflow-auto">
        {positionTab === 'Positions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[800px]">
              <thead className={`sticky top-0 ${theme.bgSecondary} ${theme.textTertiary} border-b ${theme.border} z-10`}>
                <tr>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Market</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Side</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Leverage</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Entry Price</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Mark Price</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Size</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Margin</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">PnL (USDT)</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">ROE</th>
                  <th className="text-left px-6 py-3 font-semibold uppercase tracking-wide">Liq. Price</th>
                  <th className="text-right px-6 py-3 font-semibold uppercase tracking-wide">
                    {positions.length > 0 && (
                      <button
                        onClick={onCloseAllPositions}
                        className="text-red-500 hover:text-red-400 flex items-center ml-auto gap-2 font-semibold transition-all interactive-hover"
                      >
                        <span>Close All</span>
                        <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded">{positions.length}</span>
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className={theme.text}>
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-20">
                      <div className="flex flex-col items-center space-y-4 animate-fade-in">
                        <div className={`w-16 h-16 ${theme.bgTertiary} rounded-full flex items-center justify-center`}>
                          <svg className={`w-8 h-8 ${theme.textTertiary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className={`${theme.text} font-semibold text-base mb-1`}>No Active Positions</div>
                          <div className={`${theme.textTertiary} text-sm`}>Open your first position to start trading</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  positions.map((position) => (
                    <tr key={position.id} className={`border-b ${theme.border} ${theme.hover} transition-all`}>
                      <td className="px-6 py-4 font-semibold">{position.symbol.replace('USDT', '/USD')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          position.side === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {position.side === 'BUY' ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{position.leverage}x</span>
                      </td>
                      <td className="px-6 py-4">${position.entryPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold">${position.markPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">${position.size.toFixed(2)}</td>
                      <td className="px-6 py-4">${position.margin.toFixed(2)}</td>
                      <td className={`px-6 py-4 font-bold ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 font-bold ${position.roe >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.roe >= 0 ? '+' : ''}{position.roe.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-orange-400 font-semibold">${position.liquidationPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onClosePosition(position.id)}
                          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/30 hover:border-red-500/50 interactive-hover"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {positionTab === 'Orders' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className={`w-16 h-16 ${theme.bgTertiary} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-8 h-8 ${theme.textTertiary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className={`${theme.textTertiary} text-sm`}>No open orders</div>
            </div>
          </div>
        )}
        {positionTab === 'History' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className={`w-16 h-16 ${theme.bgTertiary} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-8 h-8 ${theme.textTertiary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`${theme.textTertiary} text-sm`}>No position history yet</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
