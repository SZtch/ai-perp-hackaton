"use client"

interface Position {
  id: number
  size: number
  entryPrice: number
  leverage: number
  collateral: number
  isLong: boolean
  pnl: number
  status: string
}

interface PositionsListProps {
  positions: Position[]
  loading: boolean
}

export function PositionsList({ positions, loading }: PositionsListProps) {
  if (loading) {
    return <div className="text-center text-slate-400">Loading positions...</div>
  }

  if (positions.length === 0) {
    return <div className="text-center text-slate-400 py-8">No open positions. Start trading to see them here.</div>
  }

  return (
    <div className="space-y-3">
      {positions.map((position) => (
        <div key={position.id} className="bg-slate-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-white">
                {position.isLong ? "📈" : "📉"} {position.size} USD @ {position.leverage}x
              </div>
              <div className="text-sm text-slate-400">
                Entry: ${position.entryPrice.toFixed(2)} | Collateral: {position.collateral} TON
              </div>
            </div>
            <div className={`text-lg font-bold ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {position.pnl >= 0 ? "+" : ""}
              {position.pnl.toFixed(2)} USD
            </div>
          </div>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm">Close Position</button>
        </div>
      ))}
    </div>
  )
}
