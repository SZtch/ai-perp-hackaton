"use client"

import { useEffect, useState } from "react"

export function useIsTelegramMiniApp(): boolean {
  const [isMiniApp, setIsMiniApp] = useState(false)

  useEffect(() => {
    // Check if running in Telegram Mini App
    const isTelegram = typeof window !== "undefined" && (window as any).Telegram?.WebApp !== undefined

    setIsMiniApp(isTelegram)

    if (isTelegram) {
      ;(window as any).Telegram.WebApp.ready()
    }
  }, [])

  return isMiniApp
}
