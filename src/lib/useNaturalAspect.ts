import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { tinyUrl } from './image';

/**
 * Detect an image's true aspect ratio (width / height) from a tiny version of it.
 *
 * Used to reserve the correct space before the full image arrives, so a viewer
 * can show a placeholder at the right shape instead of collapsing to nothing.
 * Returns null until known.
 */
export function useNaturalAspect(src: string | undefined, enabled = true): number | null {
  const [ar, setAr] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !src) return;
    let alive = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (alive && img.naturalWidth && img.naturalHeight) {
        setAr(img.naturalWidth / img.naturalHeight);
      }
    };
    // a ~64px version: tiny payload, but the same aspect ratio
    img.src = tinyUrl(src, 64);
    return () => {
      alive = false;
    };
  }, [src, enabled]);

  return ar;
}

/**
 * Box styles that display an image at its own ratio, fitted inside a max height.
 *
 * `width: 100%` + `max-width: <maxHeight> * ratio` is the trick that keeps the
 * ratio intact when the viewport is short: the width shrinks instead of the
 * image being squashed or cropped.
 */
export function naturalBoxStyle(ar: number | null, maxHeightVh = 68): CSSProperties {
  return {
    aspectRatio: ar ? String(ar) : '3 / 2',
    width: '100%',
    maxWidth: ar ? `min(100%, calc(${maxHeightVh}vh * ${ar}))` : undefined,
    maxHeight: `${maxHeightVh}vh`,
  };
}
