import React, { useEffect, useRef, useState } from 'react';

const CHARS = '·:-=+*#%@'; // 暗 → 亮（最暗用點，讓整個空間填滿）
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
  const [scale, setScale] = useState(1);
  const [fontSize, setFontSize] = useState(8);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastMoveRef = useRef(0);

  // 依容器尺寸計算點陣格數（用固定字元大小，不 scale）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 10 || h < 10) return;
      const fs = w >= 360 ? 5 : 6; // PC / 平板更密、手機適中
      setFontSize(fs);
      const cols = Math.max(12, Math.ceil(w / (fs * CHAR_W)));
      const rows = Math.max(12, Math.ceil(h / fs));
      setDims({ cols, rows });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 依「實際渲染」的 grid 尺寸做細微 scale，確保真正填滿容器（字型度量可能不是 0.6）
  useEffect(() => {
    const el = containerRef.current;
    const g = gridRef.current;
    if (!el || !g) return;
    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const gw = g.scrollWidth;
      const gh = g.scrollHeight;
      if (cw < 10 || ch < 10 || gw < 10 || gh < 10) return;
      setScale(Math.max(cw / gw, ch / gh));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(g);
    return () => ro.disconnect();
  }, [grid, dims]);

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
        // cover：填滿整個容器（裁切溢出），並校正字元單元寬高比
        const drawAspect = img.width / img.height / CHAR_W;
        let dw: number;
        let dh: number;
        if (drawAspect >= cols / rows) {
          dh = rows;
          dw = rows * drawAspect;
        } else {
          dw = cols;
          dh = cols / drawAspect;
        }
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
    const now = performance.now();
    if (now - lastMoveRef.current < 80) return; // 節流，避免高密度時卡頓
    lastMoveRef.current = now;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPointer({ x, y });
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
      className={`relative flex items-center justify-center overflow-hidden select-none cursor-crosshair ascii-bob ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* 真實影像淡影，幫助看出細節 */}
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.22] pointer-events-none"
      />
      <div
        ref={gridRef}
        className="relative leading-none"
        style={{ fontSize, lineHeight: 1, transform: `scale(${scale})` }}
      >
        {grid.map((row, y) => (
          <div key={y} className="whitespace-pre">
            {row.map((ch, x) => {
              const isDot = ch === '·';
              const lum = isDot ? 0 : CHARS.indexOf(ch) / (CHARS.length - 1);
              let dy = 0;
              let opacity = isDot ? 0.5 : 0.92;
              // 兩相反色（互補高對比）：暗部深藍 → 亮部琥珀橙
              const hue = 215 - lum * 180; // 215(blue) → 35(amber)
              const light = 22 + lum * 42; // 22% → 64%
              const sat = 70 + lum * 25; // 70% → 95%
              let color = isDot ? 'hsl(215, 45%, 18%)' : `hsl(${hue}, ${sat}%, ${light}%)`;
              let glow = 'none';
              if (pointer) {
                const d = Math.hypot(x - pointer.x * cols, y - pointer.y * rows);
                const wave = Math.exp(-d / 12);
                dy = Math.sin(d * 0.7) * 3.5 * wave;
                opacity = isDot ? 0.5 : 0.6 + 0.4 * Math.exp(-d / 16);
                color = `hsl(${hue}, 100%, ${Math.min(96, light + 15 + 20 * wave)}%)`;
                glow = isDot ? 'none' : `0 0 8px rgba(255,190,120,${(0.9 * wave).toFixed(2)})`;
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
