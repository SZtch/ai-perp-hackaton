import { apiClient } from '@/lib/api-client';
import { Position, Transaction } from './trading.service';

export interface PortfolioStats {
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  todayPnl: number;
  totalTrades: number;
  winRate: number;
  totalFees: number;
  openPositions: number;
}

export interface PortfolioWallet {
  balance: number;
  locked: number;
  available: number;
  equity: number;
  unrealizedPnl: number;
  totalDeposit: number;
  totalWithdraw: number;
}

export interface PortfolioData {
  wallet: PortfolioWallet;
  positions: Position[];
  stats: PortfolioStats;
  recentActivity: Transaction[];
}

export interface QuickStats {
  balance: number;
  equity: number;
  unrealizedPnl: number;
  openPositions: number;
  lockedMargin: number;
}

class PortfolioService {
  /**
   * Get complete portfolio overview
   */
  async getPortfolio(): Promise<PortfolioData> {
    const response = await apiClient.get<PortfolioData>('/api/portfolio');
    return response.data;
  }

  /**
   * Get quick stats only (lighter endpoint)
   */
  async getQuickStats(): Promise<QuickStats> {
    const response = await apiClient.get<QuickStats>('/api/portfolio/stats');
    return response.data;
  }
}

export const portfolioService = new PortfolioService();
