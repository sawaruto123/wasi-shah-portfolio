import React, { useState } from 'react';

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

const RATIO_CLASS: Record<string, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
};

const POS_CLASS: Record<string, string> = {
  'top-left': 'object-left-top',
  top: 'object-top',
  'top-right': 'object-right-top',
  left: 'object-left',
  center: 'object-center',
  right: 'object-right',
  'bottom-left': 'object-left-bottom',
  bottom: 'object-bottom',
  'bottom-right': 'object-right-bottom',
};

/**
 * 圖片 + 載入骨架：圖片尚未載入時顯示脈動佔位，載入完成淡入；失敗時顯示佔位文字。
 * - 卡片用法（不傳 ratio）：直接 absolute inset-0 填滿父容器，無裁切比例。
 * - 專案全螢幕用法（傳 ratio）：套用指定比例與焦點裁切。
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

  const hasAspect = ratio !== undefined && ratio !== '' && ratio !== 'none';
  const aspectClass = hasAspect
    ? ratio === 'auto'
      ? detected
      : RATIO_CLASS[ratio] ?? 'aspect-video'
    : '';
  const posClass = POS_CLASS[position] ?? 'object-center';

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (ratio === 'auto') {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        setDetected(img.naturalWidth >= img.naturalHeight ? 'aspect-video' : 'aspect-[3/4]');
      }
    }
    setLoaded(true);
  };

  return (
    <div className={`overflow-hidden bg-surface-container ${aspectClass} ${className}`}>
      {!loaded && !error && (
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
          onLoad={handleLoad}
          onError={() => setError(true)}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${posClass} ${imgClassName}`}
        />
      )}
    </div>
  );
};
