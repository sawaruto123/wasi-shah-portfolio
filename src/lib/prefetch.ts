/**
 * Quietly warms the browser + CDN cache for a list of image URLs, with limited
 * concurrency, starting when the browser is idle so it never competes with the
 * content on screen. Returns a cleanup function.
 */
export function prefetchImages(urls: string[], concurrency = 4): () => void {
  const queue = Array.from(new Set(urls.filter(Boolean)));
  let current = 0;
  let active = 0;
  let cancelled = false;

  const pump = () => {
    if (cancelled) return;
    while (active < concurrency && current < queue.length) {
      const url = queue[current++];
      active++;
      const img = new Image();
      img.decoding = 'async';
      const done = () => {
        active--;
        pump();
      };
      img.onload = done;
      img.onerror = done;
      img.src = url;
    }
  };

  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof win.requestIdleCallback === 'function') {
    const id = win.requestIdleCallback(pump, { timeout: 2500 });
    return () => {
      cancelled = true;
      win.cancelIdleCallback?.(id);
    };
  }
  const id = window.setTimeout(pump, 300);
  return () => {
    cancelled = true;
    window.clearTimeout(id);
  };
}
