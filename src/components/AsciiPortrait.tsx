import React, { useEffect, useRef, useState } from 'react';

const CHARS = '·:-=+*#%@'; // 暗 → 亮
const CHAR_W = 0.6; // 等寬字體約 0.6em 寬

interface AsciiPortraitProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * 把肖像轉成互動 ASCII（canvas 渲染，高密度也流暢）：
 * - 預設全 ASCII，可用中間的 bar 左右拖曳比較真實影像
 * - 滑鼠靠近時字元像水面般波動 + 發光
 */
export const AsciiPortrait: React.FC<AsciiPortraitProps> = ({ src, alt, className = '' }) => {
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [dims, setDims] = useState({ cols: 40, rows: 30 });
  const [fontSize, setFontSize] = useState(8);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState(50); // 預設一半 ASCII、一半真實影像
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);
  const lastMoveRef = useRef(0);

  // 依容器尺寸計算點陣格數與字體大小
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 10 || h < 10) return;
      const fs = w >= 360 ? 3 : 4; // 更高密度：PC 3px、手機 4px
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

  // 載入圖片：cover + 校正字元單元寬高比，暗部填點
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
              row.push('·');
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

  // 畫到 canvas（互補雙色 + 互動波動）
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !grid) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W < 10 || H < 10) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0A1626';
    ctx.fillRect(0, 0, W, H);

    const { cols, rows } = dims;
    const charW = CHAR_W * fontSize;
    const lineH = fontSize;
    const s = Math.max(W / (cols * charW), H / (rows * lineH));
    const drawFont = fontSize * s;
    ctx.font = `${drawFont}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = 'top';
    const gw = cols * charW * s;
    const gh = rows * lineH * s;
    const ox = (W - gw) / 2;
    const oy = (H - gh) / 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = grid[y][x];
        const isDot = ch === '·';
        const lum = isDot ? 0 : CHARS.indexOf(ch) / (CHARS.length - 1);
        let dy = 0;
        let opacity = isDot ? 0.5 : 0.92;
        let color: string;
        if (pointer) {
          const d = Math.hypot(x - pointer.x * cols, y - pointer.y * rows);
          const wave = Math.exp(-d / 12);
          dy = Math.sin(d * 0.7) * fontSize * 0.5 * wave;
          opacity = isDot ? 0.5 : 0.6 + 0.4 * Math.exp(-d / 16);
          const hue = 215 - lum * 180;
          const light = 22 + lum * 42;
          color = `hsl(${hue}, 100%, ${Math.min(96, light + 15 + 20 * wave)}%)`;
        } else {
          const hue = 215 - lum * 180;
          const light = 22 + lum * 42;
          const sat = 70 + lum * 25;
          color = isDot ? 'hsl(215, 45%, 18%)' : `hsl(${hue}, ${sat}%, ${light}%)`;
        }
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.fillText(ch, ox + x * charW * s, oy + y * lineH * s + dy);
      }
    }
    ctx.globalAlpha = 1;
  }, [grid, dims, fontSize, pointer]);

  const handleMove = (e: React.PointerEvent) => {
    const now = performance.now();
    if (now - lastMoveRef.current < 80) return; // 節流
    lastMoveRef.current = now;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPointer({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  };
  const handleLeave = () => setPointer(null);

  const updatePos = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((e.clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };
  const handleBarDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updatePos(e);
  };
  const handleBarMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updatePos(e);
  };
  const handleBarUp = () => {
    draggingRef.current = false;
  };

  if (!grid) {
    return (
      <img src={src} alt={alt} referrerPolicy="no-referrer" className={`w-full h-full object-cover ${className}`} />
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative overflow-hidden select-none ascii-bob ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* 真實影像（底層） */}
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* ASCII canvas（上層，依分隔線裁切） */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* 分隔線 bar（加大命中區，易拖曳） */}
      <div
        className="absolute top-0 bottom-0 w-10 -translate-x-1/2 z-10 touch-none cursor-ew-resize"
        style={{ left: `${pos}%` }}
        onPointerDown={handleBarDown}
        onPointerMove={handleBarMove}
        onPointerUp={handleBarUp}
      >
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/90" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-ink font-bold pointer-events-none">
          <span className="text-[13px] leading-none">⇔</span>
        </div>
      </div>
    </div>
  );
};
