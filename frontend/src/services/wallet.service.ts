import { apiClient } from '@/lib/api-client';

export interface WalletBalance {
  balance: number;
  locked: number;
  available: number;
  equity: number;
  unrealizedPnl: number;
  totalDeposit: number;
  totalWithdraw: number;
}

export interface DepositRequest {
  amount: number;
  txHash: string;
}

export interface WithdrawRequest {
  amount: number;
  toAddress: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  txHash?: string;
  status: string;
  createdAt: string;
  confirmedAt?: string;
}

class WalletService {
  /**
   * Get wallet balance and stats
   */
  async getBalance(): Promise<WalletBalance> {
    const response = await apiClient.get<WalletBalance>('/api/wallet');
    return response.data;
  }

  /**
   * Get deposit information (platform address, instructions, etc.)
   */
  async getDepositInfo(amount?: number) {
    const response = await apiClient.post('/api/wallet/deposit', {
      amount: amount || 100,
    });
    return response.data;
  }

  /**
   * Confirm deposit with transaction hash
   */
  async confirmDeposit(data: DepositRequest) {
    const response = await apiClient.post('/api/wallet/deposit/confirm', data);
    return response.data;
  }

  /**
   * Withdraw funds to TON address
   */
  async withdraw(data: WithdrawRequest) {
    const response = await apiClient.post('/api/wallet/withdraw', data);
    return response.data;
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>('/api/wallet/transactions', {
      params: { limit, offset },
    });
    return response.data;
  }
}

export const walletService = new WalletService();
