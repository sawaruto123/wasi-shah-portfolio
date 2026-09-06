import React, { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'ws-theme';

// 模組層級的單一來源：所有 useTheme() 共用同一份 state，
// 避免切換只在局部生效（尤其是 3D 世界顏色沒跟著換）。
let currentDark: boolean =
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

const listeners = new Set<(dark: boolean) => void>();

function applyDark(next: boolean) {
  currentDark = next;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', next);
  }
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
}

export function useTheme() {
  const [dark, setDark] = useState<boolean>(currentDark);

  useEffect(() => {
    const listener = (v: boolean) => setDark(v);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const toggle = useCallback(() => applyDark(!currentDark), []);

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
