"use client"

import { type ReactNode, useEffect } from "react"

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  useEffect(() => {
    // Initialize Telegram Mini App
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand()
      tg.enableClosingConfirmation()
    }
  }, [])

  return <>{children}</>
}
