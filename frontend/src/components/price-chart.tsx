"use client";

import { useEffect, useRef, useState } from 'react';
import { tradingService } from '@/services/trading.service';

interface PriceChartProps {
  symbol: string;
  height?: number;
}

export function PriceChart({ symbol, height = 400 }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    // Wait for client-side only
    if (typeof window === 'undefined') return;

    let chart: any = null;
    let areaSeries: any = null;
    let updateInterval: any = null;

    const initChart = async () => {
      try {
        if (!chartContainerRef.current) {
          setError('Chart container not ready');
          return;
        }

        // Fetch data first to check if backend is working
        const historyData = await tradingService.getPriceHistory(symbol, 100);

        if (!historyData.data || historyData.data.length === 0) {
          setError('No price history available for ' + symbol);
          setLoading(false);
          return;
        }

        console.log(`[Chart] Got ${historyData.data.length} price points for ${symbol}`);

        // Load chart library
        const { createChart } = await import('lightweight-charts');

        if (!chartContainerRef.current) return;

        // Create chart
        chart = createChart(chartContainerRef.current, {
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

        // Create area series
        areaSeries = chart.addAreaSeries({
          topColor: 'rgba(34, 197, 94, 0.4)',
          bottomColor: 'rgba(34, 197, 94, 0.0)',
          lineColor: 'rgba(34, 197, 94, 1)',
          lineWidth: 2,
        });

        // Convert and set data
        const chartData = historyData.data
          .reverse()
          .map((item: any) => ({
            time: Math.floor(item.timestamp / 1000),
            value: item.price,
          }));

        areaSeries.setData(chartData);
        setChartReady(true);
        setLoading(false);

        console.log('[Chart] Successfully loaded chart with data');

        // Set up real-time updates
        updateInterval = setInterval(async () => {
          try {
            const priceData = await tradingService.getPrice(symbol);
            if (areaSeries && priceData.price > 0) {
              areaSeries.update({
                time: Math.floor(priceData.timestamp / 1000),
                value: priceData.price,
              });
            }
          } catch (err) {
            console.error('[Chart] Update error:', err);
          }
        }, 2000);

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (updateInterval) clearInterval(updateInterval);
          if (chart) chart.remove();
        };

      } catch (err: any) {
        console.error('[Chart] Init error:', err);
        setError(`Chart error: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    // Start initialization
    const cleanup = initChart();

    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [symbol, height]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <span className="text-slate-400 text-sm">Loading chart...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <div className="text-slate-400 text-sm">{error}</div>
            <div className="text-slate-500 text-xs mt-2">
              Check browser console for details
            </div>
          </div>
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
        {chartReady && (
          <span className="text-xs text-green-400">● Live</span>
        )}
      </div>
      <div ref={chartContainerRef} className="relative" />
    </div>
  );
}
