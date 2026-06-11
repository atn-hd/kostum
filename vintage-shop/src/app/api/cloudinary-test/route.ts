import { NextResponse } from 'next/server'

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  return NextResponse.json({
    cloud_name: cloudName ? `✅ ${cloudName}` : '❌ MANQUANT',
    api_key: apiKey ? `✅ ${apiKey.slice(0, 6)}...` : '❌ MANQUANT',
    api_secret: apiSecret ? '✅ présent' : '❌ MANQUANT',
  })
}
