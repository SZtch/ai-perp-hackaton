"use client"

import { useEffect, useState } from "react"

interface AIInsight {
  volatility: number
  trend: string
  fundingRate: number
  riskLevel: string
  recommendation: string
}

export function AIInsights() {
  const [insights, setInsights] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [predRes, fundingRes] = await Promise.all([fetch("/api/ai/predict"), fetch("/api/ai/funding-rate")])

        const predData = await predRes.json()
        const fundingData = await fundingRes.json()

        setInsights({
          volatility: predData.data?.predicted_volatility || 0,
          trend: predData.data?.trend || "neutral",
          fundingRate: fundingData.data?.funding_rate_percent || 0,
          riskLevel: predData.data?.confidence > 0.8 ? "low" : "medium",
          recommendation: "Monitor market conditions",
        })
      } catch (error) {
        console.error("Error fetching insights:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
    const interval = setInterval(fetchInsights, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  if (loading || !insights) {
    return <div className="text-slate-400">Loading AI insights...</div>
  }

  return (
    <div className="space-y-4">
      <div className="bg-linear-to-r from-blue-900 to-purple-900 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">AI Market Analysis</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-slate-300 text-sm mb-1">Predicted Volatility</div>
            <div className="text-2xl font-bold text-blue-400">{insights.volatility.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-slate-300 text-sm mb-1">Trend</div>
            <div className="text-2xl font-bold text-white capitalize">{insights.trend}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-300 text-sm mb-1">Funding Rate</div>
            <div className={`text-2xl font-bold ${insights.fundingRate > 0 ? "text-green-400" : "text-red-400"}`}>
              {insights.fundingRate > 0 ? "+" : ""}
              {insights.fundingRate.toFixed(3)}%
            </div>
          </div>
          <div>
            <div className="text-slate-300 text-sm mb-1">Risk Level</div>
            <div
              className={`text-2xl font-bold capitalize ${
                insights.riskLevel === "low" ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {insights.riskLevel}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-800 rounded">
          <div className="text-slate-300 text-sm">Recommendation</div>
          <div className="text-white">{insights.recommendation}</div>
        </div>
      </div>
    </div>
  )
}
