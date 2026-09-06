import React, { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'ws-theme';

function isDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export function useTheme() {
  const [dark, setDark] = useState<boolean>(isDark);

  // Sync with the class set by the inline script in index.html (and any external changes)
  useEffect(() => {
    setDark(isDark());
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? '切換到日間模式' : '切換到夜間模式'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`w-9 h-9 rounded-xl flex items-center justify-center border border-border-crisp bg-white/70 backdrop-blur-md text-ink hover:bg-primary hover:text-white transition-colors cursor-pointer ${className ?? ''}`}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
