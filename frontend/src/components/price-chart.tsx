"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { tradingService } from '@/services/trading.service';

interface PriceChartProps {
  symbol: string;
  height?: number;
}

export function PriceChart({ symbol, height = 400 }: PriceChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    let updateInterval: any = null;

    const fetchData = async () => {
      try {
        // Fetch data from backend
        const historyData = await tradingService.getPriceHistory(symbol, 100);

        if (!historyData.data || historyData.data.length === 0) {
          setError('No price history available for ' + symbol);
          setLoading(false);
          return;
        }

        console.log(`[Chart] Got ${historyData.data.length} price points for ${symbol}`);

        // Transform data for Recharts
        const transformed = historyData.data.map((point: any) => ({
          time: new Date(point.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          price: point.price,
        }));

        setChartData(transformed);
        setLoading(false);
      } catch (err: any) {
        console.error('[Chart] Error fetching price history:', err);
        setError(err.message || 'Failed to load price data');
        setLoading(false);
      }
    };

    fetchData();

    // Update every 5 seconds
    updateInterval = setInterval(fetchData, 5000);

    return () => {
      if (updateInterval) clearInterval(updateInterval);
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1c24] border border-[#25262e] px-3 py-2 rounded-lg shadow-xl">
          <p className="text-xs text-gray-400 mb-1">{payload[0].payload.time}</p>
          <p className="text-sm font-semibold text-white">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={false}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
