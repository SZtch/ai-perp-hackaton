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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Equity */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-slate-800/50 to-slate-800/50 p-5 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Equity</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${wallet.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">
            Balance: <span className="text-slate-400">${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Total PnL */}
      <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${stats.totalPnl >= 0 ? 'from-green-500/10 via-slate-800/50' : 'from-red-500/10 via-slate-800/50'} to-slate-800/50 p-5 backdrop-blur-sm border ${stats.totalPnl >= 0 ? 'border-green-500/20 hover:border-green-500/40 hover:shadow-green-500/20' : 'border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/20'} transition-all duration-300 hover:shadow-lg`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${stats.totalPnl >= 0 ? 'from-green-500/5' : 'from-red-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg ${stats.totalPnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
              <span className="text-lg">📊</span>
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total PnL</div>
          </div>
          <div className={`text-3xl font-bold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} mb-1`}>
            {stats.totalPnl >= 0 ? '+' : ''}${Math.abs(stats.totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">
            Today: <span className={stats.todayPnl >= 0 ? 'text-green-400' : 'text-red-400'}>{stats.todayPnl >= 0 ? '+' : ''}${Math.abs(stats.todayPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Unrealized PnL */}
      <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${stats.unrealizedPnl >= 0 ? 'from-cyan-500/10 via-slate-800/50' : 'from-orange-500/10 via-slate-800/50'} to-slate-800/50 p-5 backdrop-blur-sm border ${stats.unrealizedPnl >= 0 ? 'border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/20' : 'border-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/20'} transition-all duration-300 hover:shadow-lg`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${stats.unrealizedPnl >= 0 ? 'from-cyan-500/5' : 'from-orange-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg ${stats.unrealizedPnl >= 0 ? 'bg-cyan-500/20' : 'bg-orange-500/20'} flex items-center justify-center`}>
              <span className="text-lg">📈</span>
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Unrealized PnL</div>
          </div>
          <div className={`text-3xl font-bold ${stats.unrealizedPnl >= 0 ? 'text-cyan-400' : 'text-orange-400'} mb-1`}>
            {stats.unrealizedPnl >= 0 ? '+' : ''}${Math.abs(stats.unrealizedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">{stats.openPositions}</span> open position{stats.openPositions !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-slate-800/50 to-slate-800/50 p-5 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Win Rate</div>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">{stats.totalTrades}</span> total trades
          </div>
        </div>
      </div>
    </div>
  );
}
