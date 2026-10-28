import React, { useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeToggleProps {
  className?: string;
  onThemeChange?: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'stellar_bazaar_theme';

export function getInitialTheme(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'dark';
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const isDark = mode === 'dark' || (mode === 'system' && systemPrefersDark);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  onThemeChange,
}) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
    if (onThemeChange) {
      onThemeChange(mode);
    }
  }, [mode, onThemeChange]);

  const cycleTheme = () => {
    const next: Record<ThemeMode, ThemeMode> = {
      dark: 'light',
      light: 'system',
      system: 'dark',
    };
    setMode(next[mode]);
  };

  return (
    <button
      onClick={cycleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-750 text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
      aria-label={`Current theme: ${mode}. Click to cycle theme.`}
      title={`Current theme: ${mode}`}
      data-testid="theme-toggle-btn"
    >
      {mode === 'dark' && (
        <svg
          className="w-4 h-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      {mode === 'light' && (
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
      {mode === 'system' && (
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )}
      <span className="sr-only">Toggle theme ({mode})</span>
    </button>
  );
};
