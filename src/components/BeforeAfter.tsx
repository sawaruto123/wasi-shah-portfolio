import React, { useRef, useState } from 'react';
import { thumbUrl, tinyUrl } from '../lib/image';
import { useNaturalAspect, naturalBoxStyle } from '../lib/useNaturalAspect';

interface BeforeAfterProps {
  before: string;
  after: string;
  alt?: string;
  className?: string;
  /** Max height of the comparison area (vh). */
  maxHeightVh?: number;
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * 可拖曳的前後對比（Before / After）：
 * - 底層放 after（完成品），上層用 clipPath 裁切出 before（原圖）
 * - 拖曳中間 bar 或直接點擊圖片即可切換分割位置
 *
 * 版面：容器比例由原圖決定（不強制 aspect-ratio），載入前先用極小縮圖
 * 撐出正確形狀並顯示模糊預覽，所以不會只看到文字列。
 */
export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  before,
  after,
  alt = '',
  className = '',
  maxHeightVh = 68,
  beforeLabel = 'Before',
  afterLabel = 'After',
}) => {
  const [pos, setPos] = useState(50);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const ar = useNaturalAspect(after, true);

  const update = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  const tiny = tinyUrl(after, 24);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden select-none touch-none bg-surface-container"
        style={naturalBoxStyle(ar, maxHeightVh)}
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
        {/* 載入中的佔位：極小縮圖模糊放大 + 脈動底色 */}
        {!loaded && !error && <div className="absolute inset-0 animate-pulse bg-surface-container-high" />}
        {!loaded && !error && tiny !== after && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 blur-xl"
            style={{ backgroundImage: `url("${tiny}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted font-mono text-[10px] uppercase tracking-wider">
            No image
          </div>
        )}

        {/* After（底層，完成品） */}
        {!error && (
          <img
            src={thumbUrl(after, 1600)}
            alt={alt}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Before（上層，依分隔線裁切） */}
        {!error && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img
              src={thumbUrl(before, 1600)}
              alt=""
              draggable={false}
              className="block w-full h-full object-cover pointer-events-none select-none"
            />
          </div>
        )}

        {/* 標籤 */}
        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white font-mono text-[10px] font-bold uppercase tracking-wider pointer-events-none">
          {beforeLabel}
        </span>
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white font-mono text-[10px] font-bold uppercase tracking-wider pointer-events-none">
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
    </div>
  );
};
