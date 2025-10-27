import { CandlestickData } from 'lightweight-charts';

/**
 * Generate realistic candlestick data for chart display
 * This creates a more realistic price movement simulation
 */
export function generateCandlestickData(
  currentPrice: number,
  bars: number = 120
): CandlestickData[] {
  const data: CandlestickData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour bars

  // Start from a price slightly below current
  let basePrice = currentPrice * 0.95;
  const volatility = currentPrice * 0.002; // 0.2% volatility

  for (let i = 0; i < bars; i++) {
    const timestamp = now - (bars - i) * interval;

    // Random walk with mean reversion towards current price
    const drift = (currentPrice - basePrice) * 0.05; // Mean reversion
    const randomMove = (Math.random() - 0.5) * volatility * 2;

    const open = basePrice;
    const change = drift + randomMove;
    const close = open + change;

    // Calculate high and low with realistic wicks
    const wickSize = Math.abs(change) * (0.5 + Math.random());
    const high = Math.max(open, close) + Math.random() * wickSize;
    const low = Math.min(open, close) - Math.random() * wickSize;

    data.push({
      time: timestamp as any,
      open,
      high,
      low,
      close,
    });

    basePrice = close;
  }

  return data;
}

/**
 * Format time for display (HH:MM)
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
