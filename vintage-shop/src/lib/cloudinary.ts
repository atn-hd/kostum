export function optimizeImage(url: string, width?: number): string {
  if (!url) return ''
  // Inject f_auto,q_auto (+ optional width) into existing Cloudinary upload URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transforms = width ? `f_auto,q_auto,w_${width},c_limit` : `f_auto,q_auto`
    return url.replace('/upload/', `/upload/${transforms}/`)
  }
  return url
}
