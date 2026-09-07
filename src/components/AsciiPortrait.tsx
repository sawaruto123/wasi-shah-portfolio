import React, { useEffect, useRef, useState } from 'react';

const CHARS = ' .:-=+*#%@'; // 暗 → 亮

interface AsciiPortraitProps {
  src: string;
  alt?: string;
  cols?: number;
  rows?: number;
  className?: string;
}

/**
 * 把 CMS 上傳的肖像轉成互動 ASCII 藝術：
 * 滑鼠靠近時字元會像水面般波動 + 發光。
 */
export const AsciiPortrait: React.FC<AsciiPortraitProps> = ({
  src,
  alt,
  cols = 56,
  rows = 40,
  className = '',
}) => {
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = cols;
        c.height = rows;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        const scale = Math.max(cols / img.width, rows / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
        const data = ctx.getImageData(0, 0, cols, rows).data;
        const g: string[][] = [];
        for (let y = 0; y < rows; y++) {
          const row: string[] = [];
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
            row.push(CHARS[Math.min(CHARS.length - 1, Math.floor(lum * CHARS.length))]);
          }
          g.push(row);
        }
        if (alive) setGrid(g);
      } catch {
        if (alive) setGrid(null);
      }
    };
    img.onerror = () => alive && setGrid(null);
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src, cols, rows]);

  const handleMove = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rafRef.current = requestAnimationFrame(() => setPointer({ x, y }));
  };
  const handleLeave = () => setPointer(null);

  if (!grid) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  const fontSize = `clamp(5px, ${Math.round(600 / cols)}px, 10px)`;

  return (
    <div
      ref={containerRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`flex items-center justify-center overflow-hidden select-none cursor-crosshair p-3 ascii-bob ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace", background: 'radial-gradient(circle at 50% 40%, #12233A 0%, #0A1626 75%)' }}
    >
      <div className="leading-none">
        {grid.map((row, y) => (
          <div key={y} className="whitespace-pre" style={{ fontSize, lineHeight: 1 }}>
            {row.map((ch, x) => {
              let dy = 0;
              let opacity = 0.85;
              let color = 'var(--color-ink-muted)';
              let glow = 'none';
              if (pointer) {
                const d = Math.hypot(x - pointer.x * cols, y - pointer.y * rows);
                const wave = Math.exp(-d / 14);
                dy = Math.sin(d * 0.7) * 3 * wave;
                opacity = 0.35 + 0.65 * Math.exp(-d / 20);
                color = 'var(--color-primary)';
                glow = `0 0 6px rgba(76,159,255,${0.8 * wave})`;
              }
              return (
                <span
                  key={x}
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${dy.toFixed(1)}px)`,
                    opacity: opacity.toFixed(2),
                    color: ch === ' ' ? 'transparent' : color,
                    textShadow: glow,
                    willChange: 'transform',
                  }}
                >
                  {ch === ' ' ? '·' : ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
