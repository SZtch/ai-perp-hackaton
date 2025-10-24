"use client"

interface PnLDisplayProps {
  pnl: {
    realized: number
    unrealized: number
    total: number
  }
}

export function PnLDisplay({ pnl }: PnLDisplayProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <div className="text-slate-400 text-sm mb-1">Realized PnL</div>
        <div className={`text-2xl font-bold ${pnl.realized >= 0 ? "text-green-400" : "text-red-400"}`}>
          {pnl.realized >= 0 ? "+" : ""}
          {pnl.realized.toFixed(2)}
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <div className="text-slate-400 text-sm mb-1">Unrealized PnL</div>
        <div className={`text-2xl font-bold ${pnl.unrealized >= 0 ? "text-green-400" : "text-red-400"}`}>
          {pnl.unrealized >= 0 ? "+" : ""}
          {pnl.unrealized.toFixed(2)}
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <div className="text-slate-400 text-sm mb-1">Total PnL</div>
        <div className={`text-2xl font-bold ${pnl.total >= 0 ? "text-green-400" : "text-red-400"}`}>
          {pnl.total >= 0 ? "+" : ""}
          {pnl.total.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
