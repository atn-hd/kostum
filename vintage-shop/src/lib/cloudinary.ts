export function optimizeImage(url: string, width?: number): string {
  if (!url) return url
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return url
  const encoded = encodeURIComponent(url)
  const transforms = width
    ? `f_auto,q_auto,w_${width},c_limit`
    : `f_auto,q_auto`
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms}/${encoded}`
}
