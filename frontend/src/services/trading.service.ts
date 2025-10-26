import { apiClient } from '@/lib/api-client';

export interface TradingPair {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minOrderSize: number;
  maxOrderSize: number;
  maxLeverage: number;
  takerFee: number;
  makerFee: number;
  maintenanceMargin: number;
  isActive: boolean;
}

export interface CreateOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  size: number;
  leverage: number;
  price?: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: string;
  type: string;
  qty: number;
  leverage: number;
  status: string;
  fillPrice?: number;
  fee: number;
  createdAt: string;
  filledAt?: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: string;
  size: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  margin: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  roe: number;
  marginRatio: number;
  status: string;
  openedAt: string;
  closedAt?: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  volatility: number;
  confidence: number;
  timestamp: number;
}

export interface PriceHistoryResponse {
  symbol: string;
  data: PriceData[];
  total: number;
}

class TradingService {
  /**
   * Get all trading pairs
   */
  async getTradingPairs(): Promise<TradingPair[]> {
    const response = await apiClient.get<TradingPair[]>('/api/pairs');
    return response.data;
  }

  /**
   * Create a new order
   */
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/api/orders', order);
    return response.data;
  }

  /**
   * Get order history
   */
  async getOrders(limit = 50, offset = 0): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/api/orders', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get open positions with real-time PnL
   */
  async getPositions(): Promise<Position[]> {
    const response = await apiClient.get<Position[]>('/api/positions');
    return response.data;
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string): Promise<any> {
    const response = await apiClient.post(`/api/positions/${positionId}/close`);
    return response.data;
  }

  /**
   * Get position history (closed positions)
   */
  async getPositionHistory(limit = 50, offset = 0): Promise<Position[]> {
    const response = await apiClient.get<Position[]>('/api/positions/history', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<PriceData> {
    const response = await apiClient.get<PriceData>('/api/oracle/price', {
      params: { symbol },
    });
    return response.data;
  }

  /**
   * Get all current prices
   */
  async getAllPrices(): Promise<Record<string, PriceData>> {
    const response = await apiClient.get<Record<string, PriceData>>('/api/oracle/prices');
    return response.data;
  }

  /**
   * Get price history for a symbol
   */
  async getPriceHistory(symbol: string, limit = 100, offset = 0): Promise<PriceHistoryResponse> {
    const response = await apiClient.get<PriceHistoryResponse>('/api/oracle/history', {
      params: { symbol, limit, offset },
    });
    return response.data;
  }
}

export const tradingService = new TradingService();
