import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { TonConnectUIProvider } from "@tonconnect/ui-react"
import { TelegramProvider } from "@/providers/telegram-provider"

export const metadata: Metadata = {
  title: "SuperAI Perp - Perpetual DEX",
  description: "AI-powered perpetual futures trading on TON",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <TonConnectUIProvider manifestUrl={process.env.NEXT_PUBLIC_MANIFEST_URL || ""}>
          <TelegramProvider>{children}</TelegramProvider>
        </TonConnectUIProvider>
      </body>
    </html>
  )
}
