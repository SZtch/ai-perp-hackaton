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
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-center">Loading market prices...</div>
      </div>
    );
  }

  const symbols = ['TONUSDT', 'BTCUSDT', 'ETHUSDT'];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-slate-400 text-sm font-medium mb-3">📊 Live Market Prices</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {symbols.map((symbol) => {
          const price = prices[symbol];
          const baseAsset = symbol.replace('USDT', '');

          if (!price) {
            return (
              <div key={symbol} className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm mb-1">{baseAsset}/USDT</div>
                <div className="text-slate-500">Loading...</div>
              </div>
            );
          }

          return (
            <div key={symbol} className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 font-medium">{baseAsset}/USDT</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  price.confidence >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {price.confidence}%
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                ${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Vol: {price.volatility.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
