import { useEffect, useState } from 'react';

/**
 * 偵測圖片整體亮度 → 'dark'（圖偏暗，用亮字）或 'light'（圖偏亮，用暗字）。
 * 用小 canvas 取樣平均亮度。跨域圖片若無法讀取（taint），回退為 'dark'。
 */
export function useImageTone(src: string): 'dark' | 'light' {
  const [tone, setTone] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (!src) return;
    let alive = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!alive) return;
      try {
        const c = document.createElement('canvas');
        const w = 24;
        const h = 24;
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let sum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          count++;
        }
        const avg = sum / count;
        setTone(avg > 140 ? 'light' : 'dark');
      } catch {
        /* cross-origin taint → keep 'dark' */
      }
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  return tone;
}
