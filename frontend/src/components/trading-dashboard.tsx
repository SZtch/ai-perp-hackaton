"use client"

import { useState, useEffect } from "react"
import { useTonWallet } from "@tonconnect/ui-react"
import { PositionsList } from "./positions-list"
import { OpenPositionForm } from "./open-position-form"
import { MarketStats } from "./market-stats"
import { PnLDisplay } from "./pnl-display"
import { AIInsights } from "./ai-insights"

interface TradingDashboardProps {
  isMiniApp: boolean
}

export function TradingDashboard({ isMiniApp }: TradingDashboardProps) {
  const wallet = useTonWallet()
  const [activeTab, setActiveTab] = useState<"trade" | "positions" | "insights">("trade")
  const [positions, setPositions] = useState([])
  const [pnl, setPnL] = useState({ realized: 0, unrealized: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wallet?.account?.address) {
      fetchUserData()
    }
  }, [wallet?.account?.address])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [positionsRes, pnlRes] = await Promise.all([
        fetch(`/api/trading/positions/${wallet?.account?.address}`),
        fetch(`/api/trading/pnl/${wallet?.account?.address}`),
      ])

      const positionsData = await positionsRes.json()
      const pnlData = await pnlRes.json()

      setPositions(positionsData.data || [])
      setPnL(pnlData)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${isMiniApp ? "max-w-md" : "max-w-6xl"} mx-auto p-4 space-y-6`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">SuperAI Perp</h1>
        <p className="text-slate-400">AI-Powered Perpetual Futures on TON</p>
      </div>

      {/* PnL Display */}
      <PnLDisplay pnl={pnl} />

      {/* Market Stats */}
      <MarketStats />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {(["trade", "positions", "insights"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "trade" && <OpenPositionForm onSuccess={fetchUserData} />}
        {activeTab === "positions" && <PositionsList positions={positions} loading={loading} />}
        {activeTab === "insights" && <AIInsights />}
      </div>
    </div>
  )
}
