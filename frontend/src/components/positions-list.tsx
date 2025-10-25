"use client";

import { useState } from 'react';
import { Position, tradingService } from '@/services/trading.service';
import { useToast } from '@/providers/toast-provider';

interface PositionsListProps {
  positions: Position[];
  loading: boolean;
  onClose: () => void;
}

export function PositionsList({ positions, loading, onClose }: PositionsListProps) {
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const toast = useToast();

  const handleClosePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to close this position?')) {
      return;
    }

    try {
      setClosingPositionId(positionId);
      await tradingService.closePosition(positionId);
      toast.success('Position closed successfully!');
      onClose(); // Refresh positions
    } catch (error: any) {
      console.error('Error closing position:', error);
      toast.error(error.response?.data?.error || 'Failed to close position');
    } finally {
      setClosingPositionId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-slate-400">Loading positions...</div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-slate-400 mb-2">No open positions</div>
        <div className="text-sm text-slate-500">
          Start trading to see your positions here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => {
        const isLong = position.side === 'LONG';
        const isProfit = position.unrealizedPnl >= 0;

        return (
          <div key={position.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{isLong ? '📈' : '📉'}</span>
                  <span className="font-bold text-white text-lg">
                    {position.symbol}
                  </span>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isLong ? 'LONG' : 'SHORT'} {position.leverage}x
                  </span>
                </div>
                <div className="text-sm text-slate-400 space-y-0.5">
                  <div>Size: ${position.size.toFixed(2)} | Margin: ${position.margin.toFixed(2)}</div>
                  <div>Entry: ${position.entryPrice.toFixed(2)} | Mark: ${position.markPrice.toFixed(2)}</div>
                  <div className="text-orange-400">Liq: ${position.liquidationPrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  {isProfit ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                </div>
                <div className={`text-sm ${position.roe >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ROE: {isProfit ? '+' : ''}{position.roe.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Margin Ratio: {(position.marginRatio * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <button
              onClick={() => handleClosePosition(position.id)}
              disabled={closingPositionId === position.id}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white py-2 rounded transition-colors text-sm font-medium"
            >
              {closingPositionId === position.id ? 'Closing...' : 'Close Position'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
