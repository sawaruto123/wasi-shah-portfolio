/**
 * 產生壓縮/縮圖 URL，避免直接載入原始大圖造成 lag。
 * - Supabase storage：走內建的圖片轉換（resize + quality）
 * - Google user content：用 Google 的尺寸參數
 * - 其他（如本地 /images/…）：原樣回傳
 */
export function thumbUrl(url: string, width = 800, height?: number): string {
  if (!url) return url;
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const size = height
      ? `width=${width}&height=${height}&resize=cover`
      : `width=${width}&resize=contain`;
    return `${url}${url.includes('?') ? '&' : '?'}${size}&quality=70`;
  }
  if (url.includes('googleusercontent.com')) {
    return `${url}=w${width}`;
  }
  return url;
}
