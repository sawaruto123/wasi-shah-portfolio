import { useEffect, useState } from 'react';
import { tinyUrl } from './image';

type Tone = 'dark' | 'light';

/**
 * 偵測圖片整體亮度 → 'dark'（圖偏暗，用亮字）或 'light'（圖偏亮，用暗字）。
 *
 * 重點：`getImageData` 是同步的 GPU→CPU 回讀，會阻塞主執行緒（實測單張 ~20ms）。
 * 專案卡片一多，進場時就會一次爆出上百毫秒的卡頓。所以這裡：
 *   1. 結果依 URL 快取（同一張圖只算一次）
 *   2. 一次只處理一張，並排在瀏覽器空檔（requestIdleCallback）
 * 這樣即使第一次進站，也不會在捲動或房間進場時卡住。
 */
const cache = new Map<string, Tone>();
const waiters = new Map<string, Set<(t: Tone) => void>>();
const queue: string[] = [];
let pumping = false;

const idle = (fn: () => void) => {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(fn, { timeout: 900 });
  else window.setTimeout(fn, 80);
};

function sample(src: string, done: (t: Tone) => void) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    let tone: Tone = 'dark';
    try {
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0, 24, 24);
        const d = ctx.getImageData(0, 0, 24, 24).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) {
          sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        }
        tone = sum / (d.length / 4) > 140 ? 'light' : 'dark';
      }
    } catch {
      /* 跨域 taint → 保持 dark */
    }
    done(tone);
  };
  img.onerror = () => done('dark');
  // 只抓極小的縮圖來算平均亮度：亮度平均值幾乎不變，
  // 但不用為了一張 700px 的卡片去解碼整張原圖（那才是 getImageData 慢的原因）。
  img.src = tinyUrl(src, 32);
}

function pump() {
  if (pumping) return;
  const next = queue.shift();
  if (!next) return;
  pumping = true;
  sample(next, (tone) => {
    cache.set(next, tone);
    waiters.get(next)?.forEach((fn) => fn(tone));
    waiters.delete(next);
    pumping = false;
    idle(pump); // 讓出一個空檔再處理下一張，避免連續回讀擠在一起
  });
}

export function useImageTone(src: string): Tone {
  const [tone, setTone] = useState<Tone>(() => (src ? cache.get(src) ?? 'dark' : 'dark'));

  useEffect(() => {
    if (!src) return;
    const hit = cache.get(src);
    if (hit) {
      setTone(hit);
      return;
    }
    let alive = true;
    const cb = (t: Tone) => {
      if (alive) setTone(t);
    };
    let set = waiters.get(src);
    if (!set) {
      set = new Set();
      waiters.set(src, set);
    }
    set.add(cb);
    if (!queue.includes(src)) {
      queue.push(src);
      idle(pump);
    }
    return () => {
      alive = false;
      set!.delete(cb);
    };
  }, [src]);

  return tone;
}
