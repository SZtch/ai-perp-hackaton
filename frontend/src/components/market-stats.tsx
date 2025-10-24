"use client"

import { useEffect, useState } from "react"

interface MarketStats {
  totalOpenInterest: number
  totalVolume24h: number
  averageFundingRate: number
  activeTraders: number
}

export function MarketStats() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/trading/stats")
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [])

  if (loading || !stats) {
    return <div className="text-slate-400">Loading market stats...</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">Open Interest</div>
        <div className="text-xl font-bold text-white">${(stats.totalOpenInterest / 1e6).toFixed(1)}M</div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">24h Volume</div>
        <div className="text-xl font-bold text-white">${(stats.totalVolume24h / 1e6).toFixed(1)}M</div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">Funding Rate</div>
        <div className="text-xl font-bold text-blue-400">{(stats.averageFundingRate * 100).toFixed(3)}%</div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-sm mb-1">Active Traders</div>
        <div className="text-xl font-bold text-white">{stats.activeTraders}</div>
      </div>
    </div>
  )
}
