import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt?: string;
  /** 外層容器（尺寸/圓角/邊框等，不包含 aspect） */
  className?: string;
  /** 圖片本身的尺寸與效果（預設填滿容器） */
  imgClassName?: string;
  /** 'auto' = 依原圖方向自動（橫 16:9 / 直 3:4）；或指定 '16:9' | '9:16' | '4:3' | '3:4' | '1:1' */
  ratio?: string;
  loading?: 'lazy' | 'eager';
}

const RATIO_CLASS: Record<string, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
};

/**
 * 圖片 + 載入骨架：圖片尚未載入時顯示脈動佔位，載入完成淡入；失敗時顯示佔位文字。
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  ratio = 'auto',
  loading = 'lazy',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [detected, setDetected] = useState('aspect-video');

  const aspectClass = ratio !== 'auto' ? RATIO_CLASS[ratio] ?? 'aspect-video' : detected;

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
    <div className={`relative overflow-hidden bg-surface-container ${aspectClass} ${className}`}>
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
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      )}
    </div>
  );
};
