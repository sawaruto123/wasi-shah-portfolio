import React, { useCallback, useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY = 'ws-bg-opacity';
/** 預設背景不透明度（3D 世界預設只透出 25%，讓內容更清楚） */
export const DEFAULT_BG_OPACITY = 0.25;

let current = DEFAULT_BG_OPACITY;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) current = Math.min(1, Math.max(0.2, parseFloat(saved) || DEFAULT_BG_OPACITY));
} catch { /* ignore */ }

const listeners = new Set<(v: number) => void>();

export function useBgOpacity() {
  const [opacity, setOpacity] = useState(current);

  useEffect(() => {
    const l = (v: number) => setOpacity(v);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const set = useCallback((v: number) => {
    current = Math.min(1, Math.max(0.2, v));
    try {
      localStorage.setItem(STORAGE_KEY, String(current));
    } catch { /* ignore */ }
    listeners.forEach((l) => l(current));
  }, []);

  return { bgOpacity: opacity, setBgOpacity: set };
}

/** 背景透明度控制：一個按鈕 + 彈出滑桿（PC / 手機都可用） */
export const BgOpacityControl: React.FC = () => {
  const { bgOpacity, setBgOpacity } = useBgOpacity();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="調整背景透明度"
        title="Background opacity"
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-border-crisp bg-white/70 backdrop-blur-md text-ink hover:bg-primary hover:text-white transition-colors cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 p-4 rounded-2xl glass-card border border-border-crisp shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
              BG opacity
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              {Math.round(bgOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={bgOpacity}
            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
            className="opacity-slider w-full"
            style={{ ['--fill' as any]: `${((bgOpacity - 0.2) / 0.8) * 100}%` }}
          />
          <button
            onClick={() => setBgOpacity(DEFAULT_BG_OPACITY)}
            className="mt-2 w-full px-2 py-1.5 rounded-lg bg-surface-warm text-ink font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-surface-container transition-colors cursor-pointer border-none"
          >
            Reset {Math.round(DEFAULT_BG_OPACITY * 100)}%
          </button>
        </div>
      )}
    </div>
  );
};
