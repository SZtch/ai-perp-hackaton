"use client"

import type React from "react"

import { useState } from "react"
import { useTonWallet } from "@tonconnect/ui-react"

interface OpenPositionFormProps {
  onSuccess: () => void
}

export function OpenPositionForm({ onSuccess }: OpenPositionFormProps) {
  const wallet = useTonWallet()
  const [formData, setFormData] = useState({
    size: "",
    leverage: 5,
    collateral: "",
    isLong: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate inputs
      if (!formData.size || !formData.collateral) {
        throw new Error("Please fill in all fields")
      }

      if (Number.parseFloat(formData.size) <= 0 || Number.parseFloat(formData.collateral) <= 0) {
        throw new Error("Size and collateral must be positive")
      }

      if (formData.leverage < 1 || formData.leverage > 100) {
        throw new Error("Leverage must be between 1 and 100")
      }

      // Get AI risk assessment
      const riskRes = await fetch("/api/ai/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionSize: Number.parseFloat(formData.size),
          leverage: formData.leverage,
          collateral: Number.parseFloat(formData.collateral),
          isLong: formData.isLong,
        }),
      })

      const riskData = await riskRes.json()

      if (riskData.data.risk_level === "high") {
        const confirmed = confirm(
          `High risk position detected (Risk Score: ${riskData.data.risk_score.toFixed(1)}). Continue?`,
        )
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      // TODO: Send transaction to smart contract
      console.log("Opening position:", formData)

      // Reset form
      setFormData({ size: "", leverage: 5, collateral: "", isLong: true })
      onSuccess()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Open Position</h2>

      {error && <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-2 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Position Type</label>
        <div className="flex gap-2">
          {[true, false].map((isLong) => (
            <button
              key={isLong ? "long" : "short"}
              type="button"
              onClick={() => setFormData({ ...formData, isLong })}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                formData.isLong === isLong
                  ? isLong
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {isLong ? "LONG" : "SHORT"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Position Size (USD)</label>
        <input
          type="number"
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          placeholder="1000"
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Leverage: {formData.leverage}x</label>
        <input
          type="range"
          min="1"
          max="100"
          value={formData.leverage}
          onChange={(e) => setFormData({ ...formData, leverage: Number.parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Collateral (TON)</label>
        <input
          type="number"
          value={formData.collateral}
          onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
          placeholder="10"
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
      >
        {loading ? "Opening..." : "Open Position"}
      </button>
    </form>
  )
}
