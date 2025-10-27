"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface ChartSectionProps {
  data: CandlestickData[];
  darkMode: boolean;
  currentPrice: number;
  symbol: string;
}

export function ChartSection({ data, darkMode, currentPrice, symbol }: ChartSectionProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: darkMode ? '#0d0e12' : '#ffffff' },
        textColor: darkMode ? '#9ca3af' : '#6b7280',
      },
      grid: {
        vertLines: { color: darkMode ? '#1e1f26' : '#e5e7eb' },
        horzLines: { color: darkMode ? '#1e1f26' : '#e5e7eb' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: darkMode ? '#9333ea' : '#7c3aed',
          width: 1,
          style: 3,
          labelBackgroundColor: '#9333ea',
        },
        horzLine: {
          color: darkMode ? '#9333ea' : '#7c3aed',
          width: 1,
          style: 3,
          labelBackgroundColor: '#9333ea',
        },
      },
      rightPriceScale: {
        borderColor: darkMode ? '#1e1f26' : '#e5e7eb',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: darkMode ? '#1e1f26' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [darkMode]);

  // Update data when it changes
  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);

      // Fit content nicely
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="absolute inset-0 animate-fade-in" />

      {/* Price overlay badge */}
      {currentPrice > 0 && (
        <div className="absolute top-4 left-4 glass-card px-4 py-2 rounded-lg animate-fade-in-scale z-10">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">{symbol}</div>
              <div className="text-xl font-bold text-white">${currentPrice.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Loading chart data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
