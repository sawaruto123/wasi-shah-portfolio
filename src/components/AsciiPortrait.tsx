import React, { useEffect, useRef, useState } from 'react';

const CHARS = '·:-=+*#%@'; // 暗 → 亮（最暗用點，讓整個空間填滿）
const BASE_FONT = 12;
const CHAR_W = 0.6; // 等寬字體約 0.6em 寬

interface AsciiPortraitProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * 把肖像轉成互動 ASCII + 點陣背景：
 * - 圖片「contain」置中，其餘空間用點（·）填滿
 * - 滑鼠靠近時字元像水面般波動 + 發光
 */
export const AsciiPortrait: React.FC<AsciiPortraitProps> = ({ src, alt, className = '' }) => {
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [dims, setDims] = useState({ cols: 40, rows: 30 });
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 依容器尺寸計算點陣格數（用固定字元大小，不 scale）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 10 || h < 10) return;
      const cols = Math.max(12, Math.ceil(w / (BASE_FONT * CHAR_W)));
      const rows = Math.max(12, Math.ceil(h / BASE_FONT));
      setDims({ cols, rows });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 載入圖片：contain 置中，留白處用點填滿
  useEffect(() => {
    let alive = true;
    const { cols, rows } = dims;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = cols;
        c.height = rows;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        const scale = Math.min(cols / img.width, rows / img.height); // contain
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
        const data = ctx.getImageData(0, 0, cols, rows).data;
        const g: string[][] = [];
        for (let y = 0; y < rows; y++) {
          const row: string[] = [];
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            if (data[i + 3] === 0) {
              row.push('·'); // 留白 → 點
            } else {
              const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
              row.push(CHARS[Math.min(CHARS.length - 1, Math.floor(lum * CHARS.length))]);
            }
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
  }, [src, dims]);

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

  const { cols, rows } = dims;

  return (
    <div
      ref={containerRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`flex items-center justify-center overflow-hidden select-none cursor-crosshair ascii-bob ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="leading-none" style={{ fontSize: BASE_FONT, lineHeight: 1 }}>
        {grid.map((row, y) => (
          <div key={y} className="whitespace-pre">
            {row.map((ch, x) => {
              const isDot = ch === '·';
              const lum = isDot ? 0 : CHARS.indexOf(ch) / (CHARS.length - 1);
              let dy = 0;
              let opacity = isDot ? 0.5 : 0.9;
              const hue = 205 + lum * 20;
              const light = 50 + lum * 30;
              let color = isDot ? 'hsl(215, 70%, 52%)' : `hsl(${hue}, 95%, ${light}%)`;
              let glow = 'none';
              if (pointer) {
                const d = Math.hypot(x - pointer.x * cols, y - pointer.y * rows);
                const wave = Math.exp(-d / 12);
                dy = Math.sin(d * 0.7) * 3.5 * wave;
                opacity = isDot ? 0.28 : 0.5 + 0.5 * Math.exp(-d / 16);
                color = isDot ? `hsl(215, 80%, ${55 + 15 * wave}%)` : `hsl(${hue}, 100%, ${Math.min(92, light + 25)}%)`;
                glow = isDot ? 'none' : `0 0 8px rgba(110,190,255,${(0.9 * wave).toFixed(2)})`;
              }
              return (
                <span
                  key={x}
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${dy.toFixed(1)}px)`,
                    opacity: opacity.toFixed(2),
                    color,
                    textShadow: glow,
                    willChange: 'transform',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
