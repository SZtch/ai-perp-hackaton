"use client"

import { TonConnectButton } from "@tonconnect/ui-react"

export function WalletConnect() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">SuperAI Perp</h1>
          <p className="text-xl text-slate-400">AI-Powered Perpetual Futures on TON</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-slate-300 mb-6">
            Connect your TON wallet to start trading with AI-powered risk management.
          </p>
          <TonConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-white mb-1">AI Risk Management</h3>
            <p className="text-sm text-slate-400">Dynamic margin & funding rates</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-bold text-white mb-1">Fast Trading</h3>
            <p className="text-sm text-slate-400">On-chain perpetual futures</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-bold text-white mb-1">Telegram Mini App</h3>
            <p className="text-sm text-slate-400">Trade from Telegram</p>
          </div>
        </div>
      </div>
    </div>
  )
}
