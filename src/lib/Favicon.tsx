import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * 全域套用 CMS 設定的 favicon。
 * 之前這邏輯只放在 ContentProvider（只有公開首頁 `/` 有包），所以 `/admin`
 * 分頁圖不會換。現在獨立成一個元件掛在 main.tsx 最外層，所有路由都套。
 */
export const Favicon: React.FC = () => {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;

    const apply = (url: string | undefined) => {
      if (!url || cancelled) return;
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
      // index.html 預設是 svg，但 CMS 上傳的是 png；依副檔名對齊 type，避免瀏覽器忽略。
      const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
      link.type = ext === 'svg' ? 'image/svg+xml' : 'image/png';
    };

    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'profile')
          .maybeSingle();
        apply((data?.value as { favicon?: string } | null)?.favicon);
      } catch {
        // 抓不到 favicon 就保留 index.html 的預設
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};
