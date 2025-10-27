"use client";

import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartSectionProps {
  data: CandlestickData[];
  darkMode: boolean;
  currentPrice: number;
  symbol: string;
}

export function ChartSection({ data, darkMode, currentPrice, symbol }: ChartSectionProps) {
  // Transform candlestick data to line chart data
  const chartData = data.map(d => ({
    time: new Date(d.time * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    price: d.close,
    high: d.high,
    low: d.low,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${darkMode ? 'bg-[#1a1c24] border-[#25262e]' : 'bg-white border-gray-200'} border px-3 py-2 rounded-lg shadow-xl`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{payload[0].payload.time}</p>
          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-full">
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? '#1e1f26' : '#e5e7eb'}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke={darkMode ? '#6b7280' : '#9ca3af'}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            stroke={darkMode ? '#6b7280' : '#9ca3af'}
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
            stroke="#9333ea"
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={false}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0e12]">
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
