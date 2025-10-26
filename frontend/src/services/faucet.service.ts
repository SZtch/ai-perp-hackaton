import { apiClient } from '@/lib/api-client';

export interface FaucetInfo {
  faucetAmount: number;
  cooldownMs: number;
  canClaim: boolean;
  lastClaimTime: number | null;
  nextClaimTime: number | null;
  timeUntilNextClaimMs: number;
  note: string;
}

export interface FaucetClaimResponse {
  success: boolean;
  amount: number;
  newBalance: number;
  txHash: string;
  message: string;
  nextClaimTime: number;
}

export interface FaucetClaim {
  amount: number;
  txHash: string;
  claimedAt: string;
}

class FaucetService {
  /**
   * Get faucet information and claim status
   */
  async getInfo(): Promise<FaucetInfo> {
    const response = await apiClient.get<FaucetInfo>('/api/faucet/info');
    return response.data;
  }

  /**
   * Claim testnet USDT from faucet
   */
  async claim(): Promise<FaucetClaimResponse> {
    const response = await apiClient.post<FaucetClaimResponse>('/api/faucet/claim');
    return response.data;
  }

  /**
   * Get faucet claim history
   */
  async getHistory(): Promise<{ claims: FaucetClaim[]; total: number }> {
    const response = await apiClient.get<{ claims: FaucetClaim[]; total: number }>(
      '/api/faucet/history'
    );
    return response.data;
  }
}

export const faucetService = new FaucetService();
