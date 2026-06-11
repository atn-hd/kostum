/**
 * Upload a file directly from the browser to Cloudinary.
 * Gets a signed signature from our API, then POSTs the file
 * straight to Cloudinary — bypasses Vercel's 4.5 MB body limit.
 */
export async function uploadToCloudinary(file: File, folder = 'kostum'): Promise<string> {
  // 1. Get a short-lived signature from our server (tiny request, no file data)
  const sigRes = await fetch(`/api/cloudinary-sign?folder=${encodeURIComponent(folder)}`)
  if (!sigRes.ok) throw new Error('Impossible d\'obtenir la signature Cloudinary')
  const { timestamp, signature, api_key, cloud_name } = await sigRes.json()

  // 2. Upload the file directly to Cloudinary (browser → Cloudinary, no Vercel limit)
  const formData = new FormData()
  formData.append('file', file)
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
