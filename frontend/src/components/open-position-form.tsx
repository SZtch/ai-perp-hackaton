"use client";

import { useState, useEffect } from 'react';
import { tradingService } from '@/services/trading.service';

interface OpenPositionFormProps {
  onSuccess: () => void;
  availableBalance: number;
}

export function OpenPositionForm({ onSuccess, availableBalance }: OpenPositionFormProps) {
  const [formData, setFormData] = useState({
    symbol: 'TONUSDT',
    side: 'BUY' as 'BUY' | 'SELL',
    size: '',
    leverage: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Fetch current price when symbol changes
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const priceData = await tradingService.getPrice(formData.symbol);
        setCurrentPrice(priceData.price);
      } catch (err) {
        console.error('Error fetching price:', err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => clearInterval(interval);
  }, [formData.symbol]);

  // Calculate required margin
  const calculatedMargin = formData.size ? parseFloat(formData.size) / formData.leverage : 0;
  const fee = formData.size ? parseFloat(formData.size) * 0.001 : 0; // 0.1% taker fee
  const totalRequired = calculatedMargin + fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate inputs
      if (!formData.size || parseFloat(formData.size) <= 0) {
        throw new Error('Please enter a valid position size');
      }

      if (totalRequired > availableBalance) {
        throw new Error(`Insufficient balance. Required: $${totalRequired.toFixed(2)}, Available: $${availableBalance.toFixed(2)}`);
      }

      setLoading(true);

      // Create order
      await tradingService.createOrder({
        symbol: formData.symbol,
        side: formData.side,
        type: 'MARKET',
        size: parseFloat(formData.size),
        leverage: formData.leverage,
      });

      // Reset form
      setFormData({
        symbol: 'TONUSDT',
        side: 'BUY',
        size: '',
        leverage: 5,
      });

      alert('Position opened successfully!');
      onSuccess();
    } catch (err: any) {
      console.error('Error opening position:', err);
      setError(err.response?.data?.error || err.message || 'Failed to open position');
    } finally {
      setLoading(false);
    }
  };

  const symbols = [
    { value: 'TONUSDT', label: 'TON/USDT', emoji: '💎' },
    { value: 'BTCUSDT', label: 'BTC/USDT', emoji: '₿' },
    { value: 'ETHUSDT', label: 'ETH/USDT', emoji: 'Ξ' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">📈 Open Position</h2>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Symbol Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Select Market</label>
        <div className="grid grid-cols-3 gap-2">
          {symbols.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData({ ...formData, symbol: value })}
              className={`py-2 px-3 rounded font-medium transition-colors text-sm ${
                formData.symbol === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {emoji} {label.replace('/USDT', '')}
            </button>
          ))}
        </div>
        {currentPrice > 0 && (
          <div className="text-xs text-slate-400 mt-2">
            Current Price: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>

      {/* Position Type (LONG/SHORT) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Position Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, side: 'BUY' })}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              formData.side === 'BUY'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📈 LONG
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, side: 'SELL' })}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              formData.side === 'SELL'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📉 SHORT
          </button>
        </div>
      </div>

      {/* Position Size */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Position Size (USDT)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          placeholder="100.00"
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-slate-400 mt-1">
          Available: ${availableBalance.toFixed(2)} USDT
        </div>
      </div>

      {/* Leverage Slider */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Leverage: <span className="text-blue-400 font-bold">{formData.leverage}x</span>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={formData.leverage}
          onChange={(e) => setFormData({ ...formData, leverage: parseInt(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
          <span>15x</span>
          <span>20x</span>
        </div>
      </div>

      {/* Order Summary */}
      {formData.size && (
        <div className="bg-slate-700/50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Required Margin:</span>
            <span className="font-medium">${calculatedMargin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Trading Fee (0.1%):</span>
            <span className="font-medium">${fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-slate-600 pt-2">
            <span>Total Required:</span>
            <span className={totalRequired > availableBalance ? 'text-red-400' : 'text-green-400'}>
              ${totalRequired.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.size || totalRequired > availableBalance}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors"
      >
        {loading ? 'Opening Position...' : `Open ${formData.side === 'BUY' ? 'LONG' : 'SHORT'} Position`}
      </button>
    </form>
  );
}
