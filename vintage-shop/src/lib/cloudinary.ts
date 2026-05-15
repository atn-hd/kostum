export function optimizeImage(url: string, width?: number): string {
  if (!url) return url
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'df7c0hwf5'
  const encoded = encodeURIComponent(url)
  const transforms = width ? `f_auto,q_auto,w_${width},c_limit` : `f_auto,q_auto`
  const result = `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms}/${encoded}`
  console.log('[cloudinary]', result)
  return result
}
