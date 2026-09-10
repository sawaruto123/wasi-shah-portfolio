/**
 * 從影片 URL 解析出可嵌入的來源。統一處理 YouTube / Vimeo / 直接檔案，
 * 讓 VideoPlayer 與 CMS 的 preview 共用同一套邏輯。
 */
export function getVideoEmbed(
  url: string
): { type: 'youtube' | 'vimeo' | 'file'; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { type: 'file', src: url };
}
