"use client"

import { useEffect, useState } from "react"
import { useTonWallet } from "@tonconnect/ui-react"
import { TradingDashboard } from "@/components/trading-dashboard"
import { WalletConnect } from "@/components/wallet-connect"
import { useIsTelegramMiniApp } from "@/hooks/use-telegram"

export default function Home() {
  const wallet = useTonWallet()
  const isMiniApp = useIsTelegramMiniApp()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {!wallet ? <WalletConnect /> : <TradingDashboard isMiniApp={isMiniApp} />}
    </main>
  )
}
