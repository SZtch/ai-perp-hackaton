"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { tradingService } from '@/services/trading.service';

interface PriceChartProps {
  symbol: string;
  height?: number;
}

export function PriceChart({ symbol, height = 400 }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: '#1e293b' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
    });

    chartRef.current = chart;

    // Create area series
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0.0)',
      lineColor: 'rgba(34, 197, 94, 1)',
      lineWidth: 2,
    });

    seriesRef.current = areaSeries;

    // Fetch initial data
    const fetchPriceHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await tradingService.getPriceHistory(symbol, 100);

        if (!response.data || response.data.length === 0) {
          setError('No price data available');
          setLoading(false);
          return;
        }

        // Convert data to chart format (reverse to get chronological order)
        const chartData = response.data
          .reverse()
          .map(item => ({
            time: Math.floor(item.timestamp / 1000) as UTCTimestamp,
            value: item.price,
          }));

        if (areaSeries) {
          areaSeries.setData(chartData);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching price history:', err);
        setError(err.message || 'Failed to load chart data');
        setLoading(false);
      }
    };

    // Fetch latest price for real-time updates
    const fetchLatestPrice = async () => {
      try {
        const priceData = await tradingService.getPrice(symbol);

        if (areaSeries && priceData.price > 0) {
          areaSeries.update({
            time: Math.floor(priceData.timestamp / 1000) as UTCTimestamp,
            value: priceData.price,
          });
        }
      } catch (err) {
        console.error('Error fetching latest price:', err);
      }
    };

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Fetch initial data
    fetchPriceHistory();

    // Set up real-time updates (every 2 seconds)
    const interval = setInterval(fetchLatestPrice, 2000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      chart.remove();
    };
  }, [symbol, height]);

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-center h-64 text-slate-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-300 font-medium">
          {symbol.replace('USDT', '')}/USDT Price Chart
        </h3>
        {loading && (
          <span className="text-xs text-slate-500">Loading chart...</span>
        )}
      </div>
      <div ref={chartContainerRef} className="relative" />
    </div>
  );
}
