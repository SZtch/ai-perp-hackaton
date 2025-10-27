"use client";

import React from 'react';
import { TrendingUp, Layers, Target, MoreHorizontal, Activity, Moon, Sun } from 'lucide-react';

interface SidebarNavProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export function SidebarNav({ darkMode, onToggleDarkMode, onLogout }: SidebarNavProps) {
  const theme = darkMode ? {
    bg: 'bg-[#14151b]',
    bgTertiary: 'bg-[#1a1c24]',
    hover: 'hover:bg-[#1f212a]',
    textTertiary: 'text-gray-500',
  } : {
    bg: 'bg-gray-50',
    bgTertiary: 'bg-gray-100',
    hover: 'hover:bg-gray-200',
    textTertiary: 'text-gray-500',
  };

  return (
    <aside className={`w-16 ${theme.bg} border-r ${darkMode ? 'border-[#1e1f26]' : 'border-gray-200'} flex flex-col items-center py-4 shrink-0 animate-slide-in-left`}>
      {/* Logo */}
      <div className={`w-11 h-11 ${darkMode ? 'bg-white' : 'bg-gray-900'} rounded-xl flex items-center justify-center cursor-pointer mb-6 interactive-hover`}>
        <span className={`${darkMode ? 'text-[#0d0e12]' : 'text-white'} font-bold text-xl`}>S</span>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col space-y-3">
        <NavIcon icon={<TrendingUp className="w-5 h-5" />} active tooltip="Trade" darkMode={darkMode} />
        <NavIcon icon={<Layers className="w-5 h-5" />} tooltip="Pools" darkMode={darkMode} disabled />
        <NavIcon icon={<Target className="w-5 h-5" />} tooltip="Stake" darkMode={darkMode} disabled />
        <NavIcon icon={<MoreHorizontal className="w-5 h-5" />} tooltip="More" darkMode={darkMode} disabled />
      </nav>

      {/* Bottom Icons */}
      <div className="space-y-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`w-11 h-11 ${theme.bgTertiary} ${theme.hover} rounded-lg flex items-center justify-center cursor-pointer transition-all interactive-hover`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-600" />}
        </button>
        <div className="w-11 h-11 bg-purple-600/90 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-all interactive-hover">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <button
          onClick={onLogout}
          className={`w-11 h-11 ${theme.bgTertiary} rounded-lg flex items-center justify-center text-[10px] ${theme.textTertiary} cursor-pointer ${theme.hover} transition-all interactive-hover`}
          title="Logout"
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}

interface NavIconProps {
  icon: React.ReactNode;
  active?: boolean;
  tooltip?: string;
  darkMode?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function NavIcon({ icon, active, tooltip, darkMode, disabled, onClick }: NavIconProps) {
  return (
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all relative group ${
        active
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
          : disabled
          ? darkMode ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
          : darkMode
          ? 'text-gray-500 hover:bg-[#1a1c24] hover:text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      } ${!disabled && 'interactive-hover'}`}
      title={tooltip}
      onClick={!disabled ? onClick : undefined}
    >
      {icon}
      {/* Tooltip */}
      {tooltip && (
        <div className={`absolute left-full ml-2 px-3 py-2 ${darkMode ? 'bg-slate-800' : 'bg-gray-900'} text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl`}>
          {tooltip}
          {disabled && <span className="text-slate-400 ml-1.5">(Coming Soon)</span>}
        </div>
      )}
    </div>
  );
}
