"use client";

import { TrendingUp, Layers, Target, MoreHorizontal, Activity, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  darkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({ darkMode = true, onToggleTheme }: SidebarProps) {
  return (
    <aside className={`w-16 ${darkMode ? 'bg-slate-900' : 'bg-white'} border-r ${darkMode ? 'border-slate-800' : 'border-gray-200'} flex flex-col items-center py-4 shrink-0`}>
      {/* Logo */}
      <div className={`w-11 h-11 ${darkMode ? 'bg-white' : 'bg-slate-900'} rounded-xl flex items-center justify-center cursor-pointer mb-6 transition-transform hover:scale-105`}>
        <span className={`${darkMode ? 'text-slate-900' : 'text-white'} font-bold text-xl`}>P</span>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col space-y-3">
        <NavIcon
          icon={<TrendingUp className="w-5 h-5" />}
          active
          tooltip="Trade"
          darkMode={darkMode}
        />
        <NavIcon
          icon={<Layers className="w-5 h-5" />}
          tooltip="Pools"
          darkMode={darkMode}
          disabled
        />
        <NavIcon
          icon={<Target className="w-5 h-5" />}
          tooltip="Stake"
          darkMode={darkMode}
          disabled
        />
        <NavIcon
          icon={<MoreHorizontal className="w-5 h-5" />}
          tooltip="More"
          darkMode={darkMode}
          disabled
        />
      </nav>

      {/* Bottom Icons */}
      <div className="space-y-3">
        {/* Dark Mode Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`w-11 h-11 ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600" />
            )}
          </button>
        )}

        {/* Analytics */}
        <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg flex items-center justify-center cursor-pointer hover:from-purple-500 hover:to-purple-400 transition-all hover:scale-105 shadow-lg shadow-purple-600/30">
          <Activity className="w-5 h-5 text-white" />
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className={`w-11 h-11 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-lg flex items-center justify-center text-[10px] ${darkMode ? 'text-slate-600' : 'text-gray-500'} cursor-pointer ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} transition-colors`}>
          ⌘B
        </div>
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

function NavIcon({ icon, active, tooltip, darkMode = true, disabled, onClick }: NavIconProps) {
  return (
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all relative group ${
        active
          ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30'
          : disabled
          ? `${darkMode ? 'text-slate-700' : 'text-gray-400'} cursor-not-allowed`
          : `${darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
      } ${!disabled && !active ? 'hover:scale-105' : ''}`}
      title={tooltip}
      onClick={!disabled ? onClick : undefined}
    >
      {icon}

      {/* Tooltip */}
      {tooltip && (
        <div className={`absolute left-full ml-2 px-2 py-1 ${darkMode ? 'bg-slate-800' : 'bg-gray-900'} text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
          {tooltip}
          {disabled && <span className="text-slate-500 ml-1">(Coming soon)</span>}
        </div>
      )}
    </div>
  );
}
