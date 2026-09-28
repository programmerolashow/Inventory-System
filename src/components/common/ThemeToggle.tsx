import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 focus:outline-none ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
      } ${className}`}
      aria-label="Toggle visual theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline text-[11px]">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline text-[11px]">Dark</span>
        </>
      )}
    </button>
  );
};
