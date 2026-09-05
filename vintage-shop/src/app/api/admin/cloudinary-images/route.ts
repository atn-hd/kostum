import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAuth } from '@/lib/requireAuth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    // Fetch all images in the kostum/ folder (up to 500)
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'kostum/',
      max_results: 500,
      resource_type: 'image',
    })

    const images = result.resources.map((r: any) => ({
      public_id: r.public_id,
      url: r.secure_url,
      created_at: r.created_at,
      bytes: r.bytes,
    }))

    // Sort newest first
    images.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ images })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
