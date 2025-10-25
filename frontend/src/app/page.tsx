"use client";

import { useEffect, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { useAuth } from '@/providers/auth-provider';
import { WalletConnect } from '@/components/wallet-connect';
import { TradingDashboard } from '@/components/trading-dashboard';

export default function Home() {
  const wallet = useTonWallet();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Show loading while authenticating
  if (wallet && authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Authenticating with TON Proof...</p>
        </div>
      </main>
    );
  }

  // Show wallet connect if not connected or not authenticated
  if (!wallet || !isAuthenticated) {
    return <WalletConnect />;
  }

  // Show trading dashboard when authenticated
  return <TradingDashboard />;
}
