/**
 * 產生壓縮/縮圖 URL，避免直接載入原始大圖造成 lag。
 * - Supabase storage：必須走 /render/image 轉換端點。在 /object/public 端點
 *   後面接參數會被**完全忽略**，直接回傳原始大圖（實測一張縮圖 11 MB）。
 * - ImageKit：on-the-fly resize
 * - Google user content：用 Google 的尺寸參數
 * - 其他（如本地 /images/…）：原樣回傳
 */
export function thumbUrl(url: string, width = 800, height?: number): string {
  if (!url) return url;
  // ImageKit (new CMS media): on-the-fly resize + auto format/quality
  if (url.includes('ik.imagekit.io')) {
    const tr = height ? `tr=w-${width},h-${height},fo-auto` : `tr=w-${width}`;
    return `${url}${url.includes('?') ? '&' : '?'}${tr}`;
  }
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const size = height
      ? `width=${width}&height=${height}&resize=cover`
      : `width=${width}&resize=contain`;
    return `${base}?${size}&quality=70`;
  }
  if (url.includes('googleusercontent.com')) {
    return `${url}=w${width}`;
  }
  return url;
}

/**
 * Tiny blurred placeholder (LQIP) URL for transformable hosts, so a low-res
 * version paints instantly while the fuller image loads. Returns the same URL
 * for local/unknown sources (caller then falls back to a skeleton).
 */
export function tinyUrl(url: string, width = 24): string {
  if (!url) return url;
  if (url.includes('ik.imagekit.io')) {
    return `${url}${url.includes('?') ? '&' : '?'}tr=w-${width},q-40`;
  }
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // 同 thumbUrl：一定要用 /render/image，否則拿到的是原始大圖
    const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${base}?width=${width}&resize=contain&quality=40`;
  }
  if (url.includes('googleusercontent.com')) {
    return `${url}=w${width}`;
  }
  return url;
}
