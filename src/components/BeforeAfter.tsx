import React, { useRef, useState } from 'react';

interface BeforeAfterProps {
  before: string;
  after: string;
  alt?: string;
  className?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * 可拖曳的前後對比（Before / After）：
 * - 底層放 after（完成品），上層用 clipPath 裁切出 before（原圖）
 * - 拖曳中間 bar 或直接點擊圖片即可切換分割位置
 */
export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  before,
  after,
  alt = '',
  className = '',
  beforeLabel = 'Before',
  afterLabel = 'After',
}) => {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const update = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-none ${className}`}
      onPointerDown={(e) => {
        draggingRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) update(e.clientX);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    >
      {/* After（底層，完成品） */}
      <img
        src={after}
        alt={alt}
        referrerPolicy="no-referrer"
        draggable={false}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover block pointer-events-none"
      />

      {/* Before（上層，依分割線裁切） */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={before}
          alt=""
          referrerPolicy="no-referrer"
          draggable={false}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover block pointer-events-none"
        />
      </div>

      {/* 標籤 */}
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white font-mono text-[10px] font-bold uppercase tracking-wider pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white font-mono text-[10px] font-bold uppercase tracking-wider pointer-events-none">
        {afterLabel}
      </span>

      {/* 分隔線 */}
      <div
        className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/90 pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-ink font-bold text-sm">
          ⇔
        </div>
      </div>
    </div>
  );
};
