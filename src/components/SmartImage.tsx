import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt?: string;
  /** 外層容器（尺寸/圓角/邊框等，不包含 aspect） */
  className?: string;
  /** 圖片本身的尺寸與效果（預設填滿容器） */
  imgClassName?: string;
  /** 依原圖方向自動套用 16:9（橫）或 9:16（直） */
  autoAspect?: boolean;
  loading?: 'lazy' | 'eager';
}

/**
 * 圖片 + 載入骨架：圖片尚未載入時顯示脈動佔位，載入完成淡入；失敗時顯示佔位文字。
 * autoAspect：偵測原圖是橫式或直式，自動套用 16:9 / 9:16 比例。
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  autoAspect = false,
  loading = 'lazy',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [aspect, setAspect] = useState('aspect-video');

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (autoAspect) {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        setAspect(img.naturalWidth >= img.naturalHeight ? 'aspect-video' : 'aspect-[9/16]');
      }
    }
    setLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-surface-container ${autoAspect ? aspect : ''} ${className}`}>
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
