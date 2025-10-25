"use client";

interface PnLDisplayProps {
  portfolio: {
    stats: {
      realizedPnl: number;
      unrealizedPnl: number;
      totalPnl: number;
      todayPnl: number;
      totalTrades: number;
      winRate: number;
      openPositions: number;
    };
    wallet: {
      balance: number;
      equity: number;
      available: number;
    };
  };
}

export function PnLDisplay({ portfolio }: PnLDisplayProps) {
  const { stats, wallet } = portfolio;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Equity */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">💰 Total Equity</div>
        <div className="text-2xl font-bold text-blue-400">
          ${wallet.equity.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Bal: ${wallet.balance.toFixed(2)}
        </div>
      </div>

      {/* Total PnL */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">📊 Total PnL</div>
        <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Today: {stats.todayPnl >= 0 ? '+' : ''}${stats.todayPnl.toFixed(2)}
        </div>
      </div>

      {/* Unrealized PnL */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">📈 Unrealized PnL</div>
        <div className={`text-2xl font-bold ${stats.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stats.unrealizedPnl >= 0 ? '+' : ''}${stats.unrealizedPnl.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.openPositions} open position{stats.openPositions !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Trading Stats */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">🎯 Win Rate</div>
        <div className="text-2xl font-bold text-purple-400">
          {stats.winRate.toFixed(1)}%
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.totalTrades} total trades
        </div>
      </div>
    </div>
  );
}
