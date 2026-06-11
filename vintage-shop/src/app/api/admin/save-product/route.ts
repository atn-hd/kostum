import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS, server-side only, never exposed to the browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...fields } = body

    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(fields)
      .eq('id', id)
      .select('id, images')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
