import React, { useEffect, useState } from 'react';
import { RATIO_CLASS, POS_CLASS } from '../lib/aspect';
import { tinyUrl } from '../lib/image';

interface SmartImageProps {
  src: string;
  alt?: string;
  /** 外層容器（尺寸/定位/圓角/邊框等） */
  className?: string;
  /** 圖片本身的尺寸與效果（預設填滿容器） */
  imgClassName?: string;
  /** 傳入時才套用裁切比例：'auto'（依原圖方向自動 16:9 / 3:4）或 '16:9' | '9:16' | '4:3' | '3:4' | '1:1'。不傳＝不套用，適合卡片用 absolute inset-0 填滿。 */
  ratio?: string;
  /** 裁切焦點：'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' */
  position?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 圖片 + 載入骨架：
 * - 未載入時顯示脈動佔位，載入完成淡入；失敗顯示佔位文字。
 * - card 用法（不傳 ratio）→ absolute inset-0 填滿父容器。
 * - 專案用法（傳 ratio='auto'）→ 先探測原圖方向，再套用 16:9 / 3:4，避免佈局跳動。
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  ratio,
  position = 'center',
  loading = 'lazy',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [detected, setDetected] = useState('aspect-video');

  // 載入時先探測原圖方向，讓骨架比例一開始就正確（避免 16:9 → 3:4 跳動）
  useEffect(() => {
    if (ratio !== 'auto' || !src) return;
    let alive = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (alive && img.naturalWidth && img.naturalHeight) {
        setDetected(img.naturalWidth >= img.naturalHeight ? 'aspect-video' : 'aspect-[3/4]');
      }
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [ratio, src]);

  const hasAspect = ratio !== undefined && ratio !== '' && ratio !== 'none';
  const aspectClass = hasAspect
    ? ratio === 'auto'
      ? detected
      : RATIO_CLASS[ratio] ?? 'aspect-video'
    : '';
  const posClass = POS_CLASS[position] ?? 'object-center';
  const tiny = tinyUrl(src);
  const hasTiny = tiny !== src;

  return (
    <div className={`overflow-hidden bg-surface-container ${aspectClass} ${className}`}>
      {!loaded && !error && hasTiny && (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 blur-2xl"
          style={{ backgroundImage: `url("${tiny}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      {!loaded && !error && !hasTiny && (
        <div className="absolute inset-0 animate-pulse bg-surface-container-high" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-ink-muted font-mono text-[10px] uppercase tracking-wider">
          No image
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${posClass} ${imgClassName}`}
        />
      )}
    </div>
  );
};
