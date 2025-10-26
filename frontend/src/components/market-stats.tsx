"use client";

import { useEffect, useState } from 'react';
import { tradingService, PriceData } from '@/services/trading.service';

export function MarketStats() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricesData = await tradingService.getAllPrices();
        setPrices(pricesData);
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    // Refresh prices every 2 seconds for real-time updates
    const interval = setInterval(fetchPrices, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-5">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-slate-400"></div>
          <span className="text-sm">Loading market prices...</span>
        </div>
      </div>
    );
  }

  const symbols = ['TONUSDT', 'BTCUSDT', 'ETHUSDT'];

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <span className="text-lg">📊</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Live Market Prices</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {symbols.map((symbol) => {
          const price = prices[symbol];
          const baseAsset = symbol.replace('USDT', '');

          if (!price) {
            return (
              <div key={symbol} className="group relative overflow-hidden rounded-lg bg-slate-700/30 border border-slate-600/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-400">{baseAsset}/USDT</span>
                  <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>
                </div>
                <div className="text-lg font-medium text-slate-500">Loading...</div>
              </div>
            );
          }

          return (
            <div
              key={symbol}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/40 hover:from-slate-700/60 hover:to-slate-800/60 border border-slate-600/30 hover:border-slate-500/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 cursor-pointer"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

              <div className="relative">
                {/* Symbol and Live Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{baseAsset}</span>
                    <span className="text-xs text-slate-500">/USDT</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/30 text-[10px] font-semibold text-green-400 uppercase tracking-wider">
                    Live
                  </span>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="text-2xl font-bold text-white tabular-nums">
                    ${price.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(price.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
