const MAX_BYTES = 9 * 1024 * 1024  // 9 MB — marge sous la limite Cloudinary gratuite (10 MB)
const MAX_DIM = 4000                 // px max en largeur ou hauteur

/**
 * Compresse une image côté client si elle dépasse MAX_BYTES.
 * - Réduit les dimensions à MAX_DIM px max (proportionnel)
 * - Ré-encode en JPEG en baissant la qualité par paliers (0.85 → 0.5)
 * - Si déjà < MAX_BYTES, retourne le fichier tel quel sans toucher
 */
async function compressIfNeeded(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) return file

  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  for (let quality = 0.85; quality >= 0.5; quality = Math.round((quality - 0.1) * 100) / 100) {
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality)
    )
    if (blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
    }
  }

  // Dernier recours : quality 0.5 même si encore un peu lourd
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.5)
  )
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
}

/**
 * Upload a file directly from the browser to Cloudinary.
 * Gets a signed signature from our API, then POSTs the file
 * straight to Cloudinary — bypasses Vercel's 4.5 MB body limit.
 */
export async function uploadToCloudinary(file: File, folder = 'kostum'): Promise<string> {
  // 0. Compress if needed (targets 9 MB max for Cloudinary free plan)
  const fileToUpload = await compressIfNeeded(file)

  // 1. Get a short-lived signature from our server (tiny request, no file data)
  const sigRes = await fetch(`/api/cloudinary-sign?folder=${encodeURIComponent(folder)}`)
  if (!sigRes.ok) throw new Error('Impossible d\'obtenir la signature Cloudinary')
  const { timestamp, signature, api_key, cloud_name } = await sigRes.json()

  // 2. Upload the file directly to Cloudinary (browser → Cloudinary, no Vercel limit)
  const formData = new FormData()
  formData.append('file', fileToUpload)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('api_key', api_key)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload échoué')
  return data.secure_url
}
