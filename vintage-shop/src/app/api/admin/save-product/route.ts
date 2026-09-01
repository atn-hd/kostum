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

    if (id) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update(fields)
        .eq('id', id)
        .select('id, images')

      if (error) {
        console.error('save-product update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ data })
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ id: crypto.randomUUID(), ...fields }])
      .select('id, images')

    if (error) {
      console.error('save-product insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('save-product exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
