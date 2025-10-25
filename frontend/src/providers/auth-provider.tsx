"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  userAddress: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    const storedToken = authService.getToken();
    const storedAddress = authService.getUserAddress();
    if (storedToken && storedAddress) {
      setToken(storedToken);
      setUserAddress(storedAddress);
      setIsAuthenticated(true);
    }
  }, []);

  // Auto-login when wallet connects
  useEffect(() => {
    if (wallet && !isAuthenticated && !isLoading) {
      login();
    }
  }, [wallet]);

  const login = async () => {
    if (!wallet || !tonConnectUI) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Get payload from backend
      const { payload } = await authService.getPayload();

      // Step 2: Create TON Proof structure
      const tonProof = {
        address: wallet.account.address,
        proof: {
          domain: {
            value: window.location.hostname,
          },
          payload,
          timestamp: Math.floor(Date.now() / 1000),
          signature: 'dev_signature_' + payload, // In dev mode, backend accepts any signature
        },
      };

      // Step 3: Verify proof and get JWT token
      const response = await authService.verifyProof(tonProof);

      setToken(response.token);
      setUserAddress(response.user.address);
      setIsAuthenticated(true);

      console.log('✅ Authentication successful');
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.error || err.message || 'Authentication failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Logout from backend (revoke token)
      await authService.logout();

      // Disconnect TON wallet
      await tonConnectUI.disconnect();

      // Clear state
      setToken(null);
      setUserAddress(null);
      setIsAuthenticated(false);
      setError(null);

      console.log('✅ Logged out successfully');
    } catch (err: any) {
      console.error('Logout error:', err);
      // Even if server fails, clear local state
      setToken(null);
      setUserAddress(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        token,
        userAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
